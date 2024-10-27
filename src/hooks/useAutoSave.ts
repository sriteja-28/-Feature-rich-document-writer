// src/hooks/useAutoSave.ts
import { useEffect } from 'react';
import { EditorState } from 'draft-js';

const useAutoSave = (editorState: EditorState) => {
    useEffect(() => {
        const autoSave = setTimeout(() => {
            const contentState = editorState.getCurrentContent();
            const contentAsText = contentState.getPlainText();
            console.log('Auto-saving document:', contentAsText);
            localStorage.setItem('savedDocument', contentAsText); // Save to local storage
        }, 3000); // Auto-save every 3 seconds

        return () => clearTimeout(autoSave);
    }, [editorState]);
};

export default useAutoSave;
