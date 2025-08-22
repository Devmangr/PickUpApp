import React,{ createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [itemData, setItemData] = useState([]);
  const [wsHost, setWsHost] = useState('');
  const [wsPort, setWsPort] = useState('');
  const [wsRoot, setWsRoot] = useState('');
  const [wsUser, setWsUser] = useState('');
  const [wsPass, setWsPass] = useState('');
  const [seriesM, setSeriesM] = useState('');
  const [seriesT, setSeriesT] = useState('');
  const [priceList, setPriceList] = useState('');
  const [branch, setBranch] = useState('');
  const [branches, setBranches] = useState([]);
  const [branchDescr, setBranchDescr] = useState('');
  const [selectSup, setSelectSup] = useState('');
  const [currentSetId, setCurrentSetId] = useState(null);

  const handleQuantityChange = (updatedData) => {
    setItemData(updatedData);
  }
  const updateCurrentSetId = (newSetId) => {
    setCurrentSetId(newSetId);
  }
  const updateWsHost = (newWsHost) => {
    setWsHost(newWsHost)
  }
  const updateWsPort = (newWsPort) => {
    setWsPort(newWsPort)
  }
  const updateWsRoot = (newWsRoot) => {
    setWsRoot(newWsRoot)
  }
  const updateWsUser = (newWsUser) => {
    setWsUser(newWsUser)
  }
  const updateWsPass = (newWsPass) => {
    setWsPass(newWsPass)
  }
  const updateSeriesM = (newSeriesM) => {
    setSeriesM(newSeriesM);
  }
  const updateSeriesT = (newSeriesT) => {
    setSeriesT(newSeriesT);
  }
  const updatePriceList = (newPriceList) => {
    setPriceList(newPriceList);
  }
  const updateBranch = (newBranch) => {
    setBranch(newBranch);
  }
  const updateSelectSup = (newSup) => {
    setSelectSup(newSup);
  }

  const initializeSettings = async () => {
    try{
      const savedWsHost = await AsyncStorage.getItem('wsHost');
      const savedWsPort = await AsyncStorage.getItem('wsPort');
      const savedWsRoot = await AsyncStorage.getItem('wsRoot');
      const savedWsUser = await AsyncStorage.getItem('wsUser');
      const savedWsPass = await AsyncStorage.getItem('wsPass');
      const savedSeriesM = await AsyncStorage.getItem('seriesM');
      const savedSeriesT = await AsyncStorage.getItem('seriesT');
      const savedPriceList = await AsyncStorage.getItem('priceList');
      
      const savedBranches = await AsyncStorage.getItem('branches');
      const parsedBranches = await JSON.parse(savedBranches) || [];
      setBranches(parsedBranches);
      
      const savedBranchCodeid = await AsyncStorage.getItem('branch');
      
      const savedBranchDescription = (parsedBranches.find(br => br.codeid === Number(savedBranchCodeid)) || {}).description || '';
      
      setBranch(savedBranchCodeid);
      setBranchDescr(savedBranchDescription);
      setWsHost(savedWsHost || '');
      setWsPort(savedWsPort || '');
      setWsRoot(savedWsRoot || '');
      setWsUser(savedWsUser || '');
      setWsPass(savedWsPass || '');
      setSeriesM(savedSeriesM || '');
      setSeriesT(savedSeriesT || '');
      setPriceList(savedPriceList || '');
      
    } catch (error) {
      console.log('Error initializing setting: ', error)
    }
  };

  useEffect(() => {
    initializeSettings();
  }, []);

  return (
    <AppContext.Provider
      value={{
        selectSup,
        updateSelectSup,
        itemData,
        handleQuantityChange,
        wsHost,
        updateWsHost,
        wsPort,
        updateWsPort,
        wsRoot,
        updateWsRoot,
        wsUser,
        updateWsUser,
        wsPass,
        updateWsPass,
        seriesM,
        updateSeriesM,
        seriesT,
        updateSeriesT,
        priceList,
        updatePriceList,
        branch,
        updateBranch,
        branches,
        branchDescr,
        currentSetId,
        updateCurrentSetId,        
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};