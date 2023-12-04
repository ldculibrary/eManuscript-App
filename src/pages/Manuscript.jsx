import React, { useState, useEffect, useContext} from 'react';
import { useParams } from 'react-router-dom';
import AuthorList from '../components/AuthorList';
import { BsFillBookmarkPlusFill,BsFillBuildingFill,BsFillHouseExclamationFill,BsNewspaper,BsPostcard} from 'react-icons/bs';
import {FaBookReader, FaQuoteLeft, FaStar} from 'react-icons/fa'
import { Progress } from '@material-tailwind/react';
import { Footer } from '../components/Footer';
import Loading from '../components/Loading';
import CiteModal from '../components/CiteModal';
import ReadModal from '../components/ReadModal';
import RateModal from '../components/RateModal';
import { database } from '../../firebaseConfig';
import { collection, doc, where, getDoc, addDoc,serverTimestamp, query,getDocs,updateDoc} from 'firebase/firestore';
import {UserContext} from './../data/userData'
import LoadingModal from '../components/Loading';
const Manuscript = () => {
  const { id } = useParams();
  const [manuscript, setManuscript] = useState([]);
  const isLargeScreen = window.innerWidth >= 1024;
  const [readModal, setReadModal] = useState(false)
  const [rateModal, setRateModal] = useState(false)
  const [citeModal, setCiteModal] = useState(false)
  const { currentUser, logout } = useContext(UserContext);
  const [onLoading,setOnLoading] = useState(false)
  useEffect(() => {
    // Function to fetch manuscript data from Firebase Firestore

    const fetchManuscriptData = async () => {
      try {
        const manuscriptRef = doc(database, "Manuscript", id);
        const manuscriptDoc = await getDoc(manuscriptRef);
        if (manuscriptDoc.exists()) {
          // If the manuscript exists, set the manuscript state
          setManuscript({ id: manuscriptDoc.id, ...manuscriptDoc.data() });

        } else {
          // Handle case when manuscript does not exist
          console.log("Manuscript not found!");
        }
      } catch (error) {
        console.error("Error fetching manuscript:", error);
      }
      
   
    };
      fetchManuscriptData();
  }, [id]);
const handleRead = () => {
console.log("ReadButton is Clicked")
addView(id,manuscript.location,manuscript.title,currentUser.uid,currentUser.displayName,manuscript.abstract,manuscript.frontPageURL, manuscript.department)
window.open(manuscript.manuscriptPDF, '_blank')
}
const addView = async (
  manuscriptId,
  manuscriptLocation,
  manuscriptName,
  userId,
  userName,
  manuscriptAbstract,
  manuscriptFrontPageURL,
  manuscriptDepartment
) => {
  try {
    const historyRef = collection(database, "History");

  // Check if the document already exists
const querySnapshot = await getDocs(
  query(
    historyRef,
    where("ManuscriptID", "==", manuscriptId),
    where("UserID", "==", userId)
  )
);

if (!querySnapshot.empty) {
  // Document exists, update the Date field
  const existingDoc = querySnapshot.docs[0];
  const existingDocRef = doc(historyRef, existingDoc.id);

  await updateDoc(existingDocRef, {
    Date: serverTimestamp(),
  });
} else {
  // Document doesn't exist, create a new one
  const historyData = {
    Date: serverTimestamp(),
    ManuscriptID: manuscriptId,
    ManuscriptLocation: manuscriptLocation,
    ManuscriptName: manuscriptName,
    UserID: userId,
    UserName: userName,
    Department: manuscriptDepartment,
    ManuscriptPicture: manuscriptFrontPageURL,
    ManuscriptAbstract: manuscriptAbstract,
  };

  const docRef = await addDoc(historyRef, historyData);
}
  } catch (error) {
    console.error("Error updating/add view:", error);
    // Handle the error appropriately, e.g., show a user-friendly message
    throw new Error("Failed to update/add view");
  }
};


const handleCite = () => {
  setCiteModal(!citeModal)
console.log("CiteBtn is Clicked")
}
const handleRate = () => {
  setRateModal(!rateModal)
  console.log("RateBtn is Clicked")
}

const handleReadRequest = () => {
  console.log("handleReadRequest is Clicked")
  setReadModal(!readModal)
}
const handleBookmark = () => {
  console.log("BookmarkBtn is Clicked")
  setOnLoading(true)
  bookmarkManuscript(id,manuscript.location,manuscript.title,currentUser.uid,currentUser.displayName,manuscript.abstract,manuscript.frontPageURL, manuscript.department)
}
const bookmarkManuscript = async (manuscriptId, manuscriptLocation, manuscriptName, userId, userName,manuscriptAbstract, manuscriptFrontPageURL,manuscriptDeparment) => {
  try {
    const bookmarksCollectionRef = collection(database, 'Bookmark');

    // Check if the bookmark already exists
    const querySnapshot = await getDocs(
      query(
        bookmarksCollectionRef,
        where('ManuscriptID', '==', manuscriptId),
        where('UserID', '==', userId)
      )
    );
       
    // If a bookmark already exists, don't bookmark again
    if (querySnapshot.size > 0) {
      alert('Bookmark already exists');
      setOnLoading(false);
      return;
    }

    const bookmarkData = {
      Date: serverTimestamp(),
      ManuscriptID: manuscriptId,
      ManuscriptLocation: manuscriptLocation,
      ManuscriptName: manuscriptName,
      UserID: userId,
      UserName: userName,
      Department: manuscriptDeparment,
      ManuscriptPicture: manuscriptFrontPageURL,
      ManuscriptAbstract: manuscriptAbstract,
    };
    // Add the bookmark data to the 'Bookmark' collection
    const docRef = await addDoc(bookmarksCollectionRef, bookmarkData);
    alert('Bookmark added');
    setOnLoading(false);
    // Optionally, you can update the manuscript data with the new bookmark information if needed
  } catch (error) {
    console.log('Error adding bookmark: ', error);
    setOnLoading(false);
  }

  const requestReadOnSite = async () => {
    try {
      const colRef = collection(database, "BorrowManuscriptRequest")
      const requestData = {
        Date: serverTimestamp(),
        ManuscriptLocation: manuscriptLocation,
        UserID: userId,
        UserName: userName,
        Department: manuscriptDeparment,
      };
      const docRef = await  addDoc(colRef, bookmarkData);
    } catch (error) {
      console.log(error)
    }
  }
};
if(!manuscript){
  return <div>
    <LoadingModal/>
  </div>
}
  return (
    <div className='w-full '>
      {onLoading && <LoadingModal/>}
       <CiteModal open={citeModal} handler={handleCite}/>
       <ReadModal open={readModal} handler={handleReadRequest} userData={currentUser}/>
       <RateModal open={rateModal} handler={handleRate} userData={currentUser} manuscriptData={manuscript}/>
      <div>ManuscriptID: {id}</div>
      <div className='max-w-screen-xl mx-auto'>
        {/* Picture and Title and bookmark Icon */}
        <div className='w-full mb-2'>
          <div className='flex w-full px-12 h-80 gap-x-4 gap-y-1 flex-wrap justify-center duration-300'>
            <div className='lg:w-[28%] w-full flex justify-center items-center shadow-2xl  rounded-2xl  '>
              <img
                className='w-full h-32 sm:w-full sm:h-40 md:h-56 md:w-full lg:h-72 lg:w-full object-cover'
                src={manuscript.frontPageURL}
                alt='Manuscript Cover'
              />
            </div>
            <div className='lg:w-[70%] w-full  rounded-lg  '>
              <div className='border-b  p-4 flex justify-between sm:flex-nowrap flex-wrap-reverse'>
                <div className='h-auto'>
                  <p className='lg:text-2xl md:text-lg font-bold md:text-left text-center text-md sm:text-left '>
                  {manuscript.title}                  </p>
                </div>
                <div className='flex items-baseline w-full sm:w-auto justify-center '>
                  <button onClick={handleBookmark}>
                  <div className='text-maroon-800'>
                    <BsFillBookmarkPlusFill className='w-9 h-9' />
                    
                  </div>
                  </button>
                </div>
              </div>
              <div className='w-full flex flex-col p-1 md:p-2 lg:p-4'>
                <div className='w-full pb-4'>
                <div className='w-full pb-4'>
                  {manuscript.date ? (
                    <p className='text-center sm:text-left'>Year: {manuscript.date.toDate().getFullYear()}</p>
                  ) : (
                    <p className='text-center sm:text-left'>Year: N/A</p>
                  )}
                </div>

                </div>
                <div className='flex gap-2 justify-center sm:justify-start lg:flex-wrap flex-col lg:flex-row pl-2'>
                  <div className=' h-8 border-gray-900 border-l-2 px-2 '>
                  <div className='flex items-center justify-center gap-1'>
                      <div className='text-maroon-900'><BsFillBuildingFill/></div>
                      <p className='text-xs text-center font-bold flex'>Department</p>
                  </div>
                  <p className='text-xs text-center '>{manuscript.department}</p>
                  </div>
                  <div className=' h-8 border-gray-900 border-l-2 px-2 mt-4 sm:mt-0 '>
                  <div className='flex items-center justify-center gap-1'>
                      <div className='text-maroon-900'><BsPostcard/></div>
                      <p className='text-xs text-center font-bold'>Course</p>
                  </div>
                  <p className='text-xs text-center '>{manuscript.course}</p>
                  </div>
                  <div className=' h-8 border-gray-900 border-l-2 px-2 mt-8 sm:mt-0'>
                  <div className='flex items-center justify-center gap-1 '>
                      <div className='text-maroon-900'><BsFillHouseExclamationFill/></div>
                      <p className='text-xs text-center font-bold'>Location</p>
                  </div>
                  <p className='text-xs text-center'>{manuscript.location}</p>
                  </div>
                  <div className=' h-8 border-gray-900 border-l-2 px-2 lg:border-r-2 my-4 sm:my-0'>
                  <div className='flex items-center justify-center gap-1'>
                      <div className='text-maroon-900'><BsNewspaper/></div>
                      <p className='text-xs text-center font-bold'>Pages</p>
                  </div>
                  <p className='text-xs text-center'>143</p>
                  </div>
                </div>
                       
              </div>
            </div>
            {isLargeScreen ? (
          // Render the navigation bar on large screens
          <div className='flex w-full gap-x-2 justify-end'>
            <div className='h-16 flex items-center'>
              <button onClick={handleRead} className=' gap-x-2 bg-maroon-800 px-4 py-2 font-semibold text-sm text-white inline-flex items-center space-x-2 rounded'>
                <FaBookReader />Read
              </button>
            </div>
            <div className='h-16 flex items-center'>
              <button onClick={handleCite} className='gap-x-2 bg-blue-800 px-4 py-2 font-semibold text-sm text-white inline-flex items-center space-x-2 rounded'>
                <FaQuoteLeft />
                Cite
              </button>
            </div>
            <div className='h-16 flex items-center'>
              <button onClick={handleRate} className='gap-x-2 bg-orange-800 px-4 py-2 font-semibold text-sm text-white inline-flex items-center space-x-2 rounded'>
                <FaStar />
                Rate
              </button>
            </div>
            <div className='h-16 flex items-center'>
              <button onClick={handleReadRequest}  className='bg-blue-500 px-4 py-2 font-semibold text-sm text-white inline-flex items-center space-x-2 rounded'>
                Request Read On-site
              </button>
            </div>
          </div>
        ) : (
          // Render the navigation bar on small screens
          <div className='bg-maroon-600 p-2 fixed bottom-0 left-0 right-0'>
            <div className='flex justify-around'>
              <button onClick={handleReadRequest} className='text-center text-white  w-full  flex justify-center' >
                <FaBookReader />
              </button>
              <button onClick={handleCite} className='text-center text-white border-x-2 w-full  flex justify-center'>
                <FaQuoteLeft />
              </button>
              <button onClick={handleRate} className='text-center text-white w-full flex justify-center'>
                <FaStar />
              </button>
            </div>
          </div>
        )}
            <div className=''>
        {/* AuthorList */}
        <div className='w-full  justify-center'>
          <p className='text-center text-gray-900  font-semibold '>Authors </p>
            <AuthorList list={manuscript.authors || []} dept= {manuscript.department} />
        </div>
        {/* Abstract */}
        <div className=' p-2 border-t-2 w-full mt-2 border-t-maroon-700'>
        <p className='md:text-left text-center text-gray-900  font-semibold '>Abstract</p>
          <div className='text-xs md:text-sm text-justify py-2'>
            <p className='indent-8'>
            {manuscript.abstract}
            </p>
          </div>
        </div>
        <div className='w-full mb-4'>
          <div className='p-2 border-t-2 w-full mt-2 border-t-maroon-700'>
            <div className='h-56 flex flex-wrap gap-x-2 md:gap-0 '>
              <div className='md:w-1/2 w-full h-40 px-2'>
                <div className='text-center md:text-left text-gray-900  flex font-semibold border-b items-center'>Ratings
                (<p className='text-sm flex items-center'>{manuscript.rate} <p className='text-yellow-800'> <FaStar/></p></p>)</div>
                <div className='py-2'>
                  <div className='flex items-center w-[90%] gap-2'>
                  <div className='text-sm sm:hidden'>5</div>
                  <Progress value={90} color='amber' className='border border-gray-900/10 bg-blue-900/5 p-1' size='lg'/>
                  <div className='hidden sm:contents pl-10 font-bold text-center text-sm '>5</div>
                  </div>
                  <div className='flex items-center w-[90%] gap-2'>
                    <div className='text-sm sm:hidden'>4</div>
                  <Progress value={70} color='amber' className='border border-gray-900/10 bg-blue-900/5 p-1' size='lg'/>
                  <div className='hidden sm:contents pl-10 font-bold text-center text-sm'>4</div>
                  </div>
                  <div className='flex items-center w-[90%] gap-2'>
                  <div className='text-sm sm:hidden'>3</div>
                  <Progress value={40} color='amber' className='border border-gray-900/10 bg-blue-900/5 p-1' size='lg'/>
                  <div className='hidden sm:contents pl-10 font-bold text-center text-sm'>3</div>
                  </div>
                  <div className='flex items-center w-[90%] gap-2'>
                  <div className='text-sm sm:hidden'>2</div>
                  <Progress value={20} color='amber' className='border border-gray-900/10 bg-blue-900/5 p-1' size='lg'/>
                  <div className='hidden sm:contents pl-10 font-bold text-center text-sm '>2</div>
                  </div>
                  <div className='flex items-center w-[90%] gap-2'>
                  <div className='text-sm sm:hidden'>1</div>
                  <Progress value={10} color='amber' className='border border-gray-900/10 bg-blue-900/5 p-1' size='lg'/>
                  <div className='hidden sm:contents pl-10 font-bold text-center text-sm'>1</div>
                  </div>
                </div>
              </div>
              <div className='md:w-1/2 w-full h-52 px-2 '>
                <div className='text-center md:text-left text-gray-900 font-semibold border-b '>Rules and Regulations</div>
                <p className='text-justify md:text-left text-xs sm:text-sm  py-2'>
                By accessing and reading unpublished manuscripts on this platform,
                 users agree to abide by the following rules and regulations. 
                 Users may only view and read manuscripts for personal, non-commercial purposes.
                  Reproduction, distribution, or any form of unauthorized sharing of the manuscript
                   content is strictly prohibited. Users must respect the intellectual property rights of 
                   the authors and refrain from disclosing or using any information contained in the unpublished 
                   manuscripts without explicit permission. Any violation of these rules may result in the suspension
                    or termination of the user's access to the platform. The platform assumes no responsibility for the 
                    consequences of any misuse or unauthorized dissemination of unpublished manuscript content by users.
                </p>
                </div>
              <Footer/>
            </div>
          </div>          
        </div>
      </div>
      </div>
      </div>
    </div>
    </div>
  );
};

export default Manuscript;