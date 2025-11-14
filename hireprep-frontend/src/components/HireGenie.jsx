import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, FileText, Sparkles, Trash2, X } from 'lucide-react';

const HireGenie = ({ initialPrompt = '' }) => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "👋 Hi! I'm HireGenie, your AI placement assistant. I can help you with:\n\n• Resume analysis and improvements\n• Interview preparation tips\n• Company-specific guidance\n• Technical question practice\n• Career advice\n\nYou can also upload your resume for personalized feedback. How can I help you today?"
        }
    ]);
    const [input, setInput] = useState(initialPrompt);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedResume, setUploadedResume] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (initialPrompt) {
            handleSendMessage(initialPrompt);
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file only');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        try {
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            setUploadedResume({
                name: file.name,
                base64: base64,
                size: file.size
            });

            setMessages(prev => [...prev, {
                role: 'system',
                content: `✅ Resume "${file.name}" uploaded successfully! I'll analyze it for you.`
            }]);

            setTimeout(() => {
                handleSendMessage('Please analyze my resume and provide detailed feedback on improvements.');
            }, 500);

        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload resume. Please try again.');
        }
    };

    const removeResume = () => {
        setUploadedResume(null);
        setMessages(prev => [...prev, {
            role: 'system',
            content: '🗑️ Resume removed from context.'
        }]);
    };

    const handleSendMessage = async (messageText = input) => {
        if (!messageText.trim()) return;

        const userMessage = messageText.trim();
        setInput('');

        setMessages(prev => [...prev, {
            role: 'user',
            content: userMessage
        }]);

        setIsLoading(true);

        try {
            const apiMessages = [
                {
                    role: 'user',
                    content: uploadedResume
                        ? [
                            {
                                type: 'document',
                                source: {
                                    type: 'base64',
                                    media_type: 'application/pdf',
                                    data: uploadedResume.base64
                                }
                            },
                            {
                                type: 'text',
                                text: userMessage
                            }
                        ]
                        : userMessage
                }
            ];

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1000,
                    system: `You are HireGenie, an expert AI placement assistant for college students. You help with:
- Resume analysis and optimization
- Interview preparation (technical and HR)
- Company research and insights
- Mock interview practice
- Career guidance
- Aptitude and coding tips

Be encouraging, professional, and provide actionable advice. When analyzing resumes, be specific and constructive. Format your responses clearly with bullet points and sections where appropriate.`,
                    messages: apiMessages
                })
            });

            const data = await response.json();

            const assistantMessage = data.content
                .filter(item => item.type === 'text')
                .map(item => item.text)
                .join('\n\n');

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: assistantMessage
            }]);

        } catch (error) {
            console.error('Error calling API:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        if (window.confirm('Are you sure you want to clear the chat history?')) {
            setMessages([{
                role: 'assistant',
                content: "Chat cleared! How can I help you today?"
            }]);
            setUploadedResume(null);
        }
    };

    const formatMessage = (content) => {
        return content.split('\n').map((line, i) => (
            <React.Fragment key={i}>
                {line}
                {i < content.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
    };

    return (
        <div className="hiregenie-container">
            {/* Header */}
            <div className="hiregenie-header">
                <div className="hiregenie-header-content">
                    <div className="hiregenie-logo">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h1 className="hiregenie-title">HireGenie</h1>
                        <p className="hiregenie-subtitle">Your AI Placement Assistant</p>
                    </div>
                </div>
                <button onClick={clearChat} className="hiregenie-clear-btn">
                    <Trash2 size={16} />
                    Clear Chat
                </button>
            </div>

            {/* Resume Upload Status */}
            {uploadedResume && (
                <div className="hiregenie-resume-status">
                    <div className="hiregenie-resume-info">
                        <FileText size={18} color="#2563eb" />
                        <span>Resume attached: {uploadedResume.name}</span>
                    </div>
                    <button onClick={removeResume} className="hiregenie-resume-remove">
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Messages Container */}
            <div className="hiregenie-messages">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`hiregenie-message-wrapper ${message.role === 'user' ? 'user' : 'assistant'}`}
                    >
                        <div className={`hiregenie-message ${message.role}`}>
                            {formatMessage(message.content)}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="hiregenie-message-wrapper assistant">
                        <div className="hiregenie-message assistant">
                            <div className="hiregenie-typing">
                                <div className="hiregenie-typing-dot"></div>
                                <div className="hiregenie-typing-dot"></div>
                                <div className="hiregenie-typing-dot"></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="hiregenie-input-area">
                <div className="hiregenie-input-wrapper">
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hiregenie-file-input"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className={`hiregenie-upload-btn ${uploadedResume ? 'active' : ''}`}
                        title="Upload Resume (PDF)"
                    >
                        <Upload size={20} />
                    </button>

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Ask me anything about placements, interviews, or resume tips..."
                        disabled={isLoading}
                        className="hiregenie-textarea"
                    />

                    <button
                        onClick={() => handleSendMessage()}
                        disabled={!input.trim() || isLoading}
                        className="hiregenie-send-btn"
                    >
                        <Send size={18} />
                        Send
                    </button>
                </div>
                <p className="hiregenie-hint">
                    Press Enter to send • Shift + Enter for new line
                </p>
            </div>
        </div>
    );
};

export default HireGenie;