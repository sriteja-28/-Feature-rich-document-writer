// src/App.tsx
import React, { useState } from 'react';
import { EditorState } from 'draft-js';
import DocumentEditor from './components/Editor';

const App: React.FC = () => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    return (
        <div>
           <h1 style={{ textAlign: 'center' }}>Document Editor</h1>

            <DocumentEditor editorState={editorState} setEditorState={setEditorState} />
        </div>
    );
};

export default App;
