import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, setState] = useState({
    itemData: [],
    wsHost: "",
    wsPort: "",
    wsRoot: "",
    wsUser: "",
    wsPass: "",
    seriesM: "",
    seriesT: "",
    priceList: "",
    branch: "",
    branches: [],
    branchDescr: "",
    selectSup: "",
  });

  const setField = useCallback((key, value) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleQuantityChange = useCallback((updatedData) => {
    setField("itemData", updatedData);
  }, [setField]);

  const updateSelectSup = useCallback((val) => setField("selectSup", val), [setField]);
  const updateWsHost = useCallback((val) => setField("wsHost", val), [setField]);
  const updateWsPort = useCallback((val) => setField("wsPort", val), [setField]);
  const updateWsRoot = useCallback((val) => setField("wsRoot", val), [setField]);
  const updateWsUser = useCallback((val) => setField("wsUser", val), [setField]);
  const updateWsPass = useCallback((val) => setField("wsPass", val), [setField]);
  const updateSeriesM = useCallback((val) => setField("seriesM", val), [setField]);
  const updateSeriesT = useCallback((val) => setField("seriesT", val), [setField]);
  const updatePriceList = useCallback((val) => setField("priceList", val), [setField]);
  const updateBranch = useCallback((val) => setField("branch", val), [setField]);

  const contextValue = useMemo(() => ({
    ...state,
    handleQuantityChange,
    updateSelectSup,
    updateWsHost,
    updateWsPort,
    updateWsRoot,
    updateWsUser,
    updateWsPass,
    updateSeriesM,
    updateSeriesT,
    updatePriceList,
    updateBranch,
  }), [state, handleQuantityChange, updateSelectSup, updateWsHost, updateWsPort, updateWsRoot, updateWsUser, updateWsPass, updateSeriesM, updateSeriesT, updatePriceList, updateBranch]);

  const initializeSettings = async () => {
    try {
      const keys = [
        "wsHost",
        "wsPort",
        "wsRoot",
        "wsUser",
        "wsPass",
        "seriesM",
        "seriesT",
        "priceList",
        "branch",
        "branches"
      ];

      const stores = await AsyncStorage.multiGet(keys);
      const data = Object.fromEntries(stores);

      const parsedBranches = JSON.parse(data.branches || "[]");
      const branchDescr =
        parsedBranches.find((b) => b.codeid === Number(data.branch))?.description || "";

      setState((prev) => ({
        ...prev,
        wsHost: data.wsHost || "",
        wsPort: data.wsPort || "",
        wsRoot: data.wsRoot || "",
        wsUser: data.wsUser || "",
        wsPass: data.wsPass || "",
        seriesM: data.seriesM || "",
        seriesT: data.seriesT || "",
        priceList: data.priceList || "",
        branch: data.branch || "",
        branches: parsedBranches,
        branchDescr,
      }));
    } catch (error) {
      console.error("❌ Σφάλμα κατά το αρχικό φόρτωμα ρυθμίσεων:", error);
    }
  };

  useEffect(() => {
    initializeSettings();
  }, []);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
