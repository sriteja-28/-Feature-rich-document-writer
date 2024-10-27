// src/components/DocumentEditor.tsx
import React, { useEffect, useState } from 'react';
import { EditorState, Editor, RichUtils, DraftEditorCommand, convertToRaw, ContentState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import './DocumentEditor.css';

interface DocumentEditorProps {
    editorState: EditorState;
    setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ editorState, setEditorState }) => {
    const [activeStyles, setActiveStyles] = useState<string[]>([]);
    const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(false);
    const [filename, setFilename] = useState('document.txt'); // Default filename with .txt extension

    // Toggling inline and block styles
    const toggleInlineStyle = (style: string) => setEditorState(RichUtils.toggleInlineStyle(editorState, style));
    const toggleBlockType = (blockType: string) => setEditorState(RichUtils.toggleBlockType(editorState, blockType));

    // Update button states based on current inline style
    useEffect(() => {
        const currentStyle = editorState.getCurrentInlineStyle();
        setActiveStyles(currentStyle.toArray());
    }, [editorState]);

    // Check if a style is currently active
    const isStyleActive = (style: string) => activeStyles.includes(style);

    // Save content to a file
    const saveContentToFile = async () => {
        const contentState = editorState.getCurrentContent();
        const plainText = contentState.getPlainText(); // Get only text values

        const blob = new Blob([plainText], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename || 'document.txt'; // Use user-defined filename or default
        link.click();
        URL.revokeObjectURL(link.href);
    };

    // Auto-save content if enabled
    useEffect(() => {
        if (isAutoSaveEnabled) {
            const intervalId = setInterval(() => saveContentToLocalStorage(), 5000);
            return () => clearInterval(intervalId);
        }
    }, [isAutoSaveEnabled, editorState]);

    // Save content to localStorage for auto-save
    const saveContentToLocalStorage = () => {
        const content = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
        localStorage.setItem('autoSaveContent', content);
    };

    // Keyboard shortcuts handler
    const handleKeyCommand = (command: DraftEditorCommand) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            setEditorState(newState);
            return 'handled';
        }
        return 'not-handled';
    };

    // Keyboard shortcuts like Word
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            toggleInlineStyle('BOLD');
        }
        if (e.ctrlKey && e.key === 'i') {
            e.preventDefault();
            toggleInlineStyle('ITALIC');
        }
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            toggleInlineStyle('UNDERLINE');
        }
    };

    // Function to handle image insertion
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const contentState = editorState.getCurrentContent();
                const newContentState = ContentState.createFromText(contentState.getPlainText() + `\n![image](${reader.result})`);
                setEditorState(EditorState.createWithContent(newContentState));
            };
            reader.readAsDataURL(files[0]);
        }
    };

    return (
        <div className="editorContainer" onKeyDown={handleKeyDown}>
            {/* Toolbar with additional buttons */}
            <div style={{ marginBottom: '10px', display: 'flex', gap: '5px' }}>
                <button onClick={() => toggleInlineStyle('BOLD')} style={getButtonStyle(isStyleActive('BOLD'))}>Bold</button>
                <button onClick={() => toggleInlineStyle('ITALIC')} style={getButtonStyle(isStyleActive('ITALIC'))}>Italic</button>
                <button onClick={() => toggleInlineStyle('UNDERLINE')} style={getButtonStyle(isStyleActive('UNDERLINE'))}>Underline</button>
                <button onClick={() => toggleInlineStyle('STRIKETHROUGH')} style={getButtonStyle(isStyleActive('STRIKETHROUGH'))}>Strikethrough</button>
                
                <button onClick={() => toggleBlockType('left-align')} style={getButtonStyle(isStyleActive('left-align'))}>Left Align</button>
                <button onClick={() => toggleBlockType('center-align')} style={getButtonStyle(isStyleActive('center-align'))}>Center</button>
                <button onClick={() => toggleBlockType('right-align')} style={getButtonStyle(isStyleActive('right-align'))}>Right Align</button>
                <button onClick={() => toggleBlockType('justify')} style={getButtonStyle(isStyleActive('justify'))}>Justify</button>

                {/* Filename input field */}
                <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    placeholder="Enter filename"
                    style={{ marginLeft: '10px' }}
                />

                <button onClick={saveContentToFile}>Save</button>
                <label>
                    Auto Save
                    <input type="checkbox" checked={isAutoSaveEnabled} onChange={() => setIsAutoSaveEnabled(!isAutoSaveEnabled)} />
                </label>


            </div>

            <div className="editor">
                <Editor
                    editorState={editorState}
                    onChange={setEditorState}
                    handleKeyCommand={handleKeyCommand}
                />
            </div>
        </div>
    );
};

// Styling function for button based on active state
const getButtonStyle = (isActive: boolean) => ({
    fontWeight: isActive ? 'bold' : 'normal',
    color: isActive ? '#000' : '#888',
    backgroundColor: isActive ? '#e0e0e0' : '#f8f8f8',
    border: '1px solid #ccc',
});

export default DocumentEditor;
