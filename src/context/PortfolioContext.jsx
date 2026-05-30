import { createContext, useContext, useState, useEffect } from 'react';
import { db, storage } from '../config/firebase';
import { doc, getDoc, setDoc, onSnapshot, collection, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const PortfolioContext = createContext();

export function PortfolioProvider({ children }) {
  const [profile, setProfile] = useState({
    name: "Loading...",
    title: "",
    profileImage: "",
    bio: "",
    skills: [],
    certs: []
  });

  const [projects, setProjects] = useState([]);

  const [isAdminAuth, setIsAdminAuth] = useState(() => {
    return localStorage.getItem('portfolio_admin_auth') === 'true';
  });

  const [loading, setLoading] = useState(true);

  // Default data for initialization
  const defaultProfile = {
    name: "Juan Bravo Lopez",
    title: "Software Engineer & Data Scientist",
    profileImage: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=2070&auto=format&fit=crop",
    bio: "Passionate developer with a strong background in both full-stack web development and data science. I build scalable applications and extract actionable insights from complex datasets. Constantly learning and exploring new technologies.",
    skills: ['React', 'Node.js', 'Python', 'Machine Learning', 'Data Analysis', 'SQL', 'TypeScript', 'AWS'],
    certs: [
      { id: 1, title: 'AWS Certified Solutions Architect', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { id: 2, title: 'Meta Front-End Developer', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
    ]
  };

  useEffect(() => {
    // Safety timeout: force loading to false after 5 seconds
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("Portfolio initialization timed out. Using available data.");
        setLoading(false);
      }
    }, 5000);

    // Reference to profile doc
    const profileRef = doc(db, 'portfolio', 'profile');
    
    // Check if profile exists, if not initialize
    getDoc(profileRef).then(docSnap => {
      if (!docSnap.exists()) {
        return setDoc(profileRef, defaultProfile);
      }
    }).catch(err => {
      console.error("Error checking/initializing profile:", err);
    });

    // Realtime listener for Profile
    const unsubProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          ...data,
          skills: data.skills || [],
          certs: data.certs || []
        });
      } else {
        // Fallback to default if somehow the doc is deleted
        setProfile(defaultProfile);
      }
      setLoading(false);
    }, (err) => {
      console.error("Profile listener error:", err);
      setLoading(false); // Ensure loading stops even on error
    });

    // Realtime listener for Projects
    const projectsRef = collection(db, 'projects');
    const unsubProjects = onSnapshot(projectsRef, (snapshot) => {
      const projList = [];
      snapshot.forEach(doc => {
        projList.push({ id: doc.id, ...doc.data() });
      });
      setProjects(projList);
    }, (err) => {
      console.error("Projects listener error:", err);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubProfile();
      unsubProjects();
    }
  }, [loading]); // Added loading to dependency array to match timeout logic if needed, but [] is also fine

  useEffect(() => {
    localStorage.setItem('portfolio_admin_auth', isAdminAuth);
  }, [isAdminAuth]);

  // Actions
  const updateProfile = async (data) => {
    const profileRef = doc(db, 'portfolio', 'profile');
    await setDoc(profileRef, data, { merge: true });
  };

  const addProject = async (project) => {
    const newDocRef = doc(collection(db, 'projects'));
    await setDoc(newDocRef, project);
  };

  const updateProject = async (id, data) => {
    const projRef = doc(db, 'projects', id);
    await setDoc(projRef, data, { merge: true });
  };

  const deleteProject = async (id) => {
    await deleteDoc(doc(db, 'projects', id));
  };

  const uploadFile = async (file, folderPath) => {
    if (!file) return null;
    const fileRef = ref(storage, `${folderPath}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };
  
  const loginAdmin = () => setIsAdminAuth(true);
  const logoutAdmin = () => setIsAdminAuth(false);

  return (
    <PortfolioContext.Provider value={{
      profile, projects, isAdminAuth, loading,
      updateProfile, addProject, updateProject, deleteProject, uploadFile,
      loginAdmin, logoutAdmin
    }}>
      {!loading ? children : <div className="page-container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}><h2 className="text-gradient">Loading Portfolio...</h2></div>}
    </PortfolioContext.Provider>
  );
}

export const usePortfolio = () => useContext(PortfolioContext);
