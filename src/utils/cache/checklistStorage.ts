// checklistStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHECKLIST_KEY = 'storeSetupChecklist';

export const defaultChecklist = {
  logoUploaded: false,
  bannerUploaded: false,
  locationShipping: false,
  payMethods: false,
  categoriesCreated: false,
  firstPostCreated: false,
  firstProductCreated: false,

};

export const getChecklist = async () => {
  const saved = await AsyncStorage.getItem(CHECKLIST_KEY);
  return saved ? JSON.parse(saved) : defaultChecklist;
};

export const updateChecklistField = async (field: string, value: boolean) => {
  const current = await getChecklist();
  const updated = { ...current, [field]: value };
  await AsyncStorage.setItem(CHECKLIST_KEY, JSON.stringify(updated));
  return updated;
};

export const resetChecklist = async () => {
  await AsyncStorage.removeItem(CHECKLIST_KEY);
};
