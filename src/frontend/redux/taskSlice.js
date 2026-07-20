import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  drafts: {}, // Maps key 'new' or taskId to form data object
  currentAttachments: [], // Array of { id, name, size, type, url }
};

export const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    saveDraft: (state, action) => {
      const { key, formValues } = action.payload;
      state.drafts[key] = {
        ...formValues,
        savedAt: new Date().toISOString()
      };
    },
    clearDraft: (state, action) => {
      const { key } = action.payload;
      delete state.drafts[key];
    },
    addAttachment: (state, action) => {
      state.currentAttachments.push(action.payload);
    },
    removeAttachment: (state, action) => {
      state.currentAttachments = state.currentAttachments.filter(
        att => att.id !== action.payload
      );
    },
    setAttachments: (state, action) => {
      state.currentAttachments = action.payload || [];
    },
    clearAttachments: (state) => {
      state.currentAttachments = [];
    }
  }
});

export const {
  saveDraft,
  clearDraft,
  addAttachment,
  removeAttachment,
  setAttachments,
  clearAttachments
} = taskSlice.actions;

export default taskSlice.reducer;
