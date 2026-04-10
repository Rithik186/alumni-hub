import React from 'react';
import { useNavigate } from 'react-router-dom';

const Avatar = ({ src, name, size = 40, className = '', userId }) => {
    const navigate = useNavigate();

    const handleClick = (e) => {
        if (userId) {
            e.stopPropagation();
            navigate(`/profile/${userId}`);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`rounded-full bg-gradient-to-br from-indigo-100 to-slate-100 flex items-center justify-center font-semibold text-slate-500 overflow-hidden bg-cover bg-center flex-shrink-0 border-2 border-white shadow-sm ${userId ? 'cursor-pointer hover:border-indigo-300 transition-all' : ''} ${className}`}
            style={{ 
                width: size, 
                height: size, 
                fontSize: size * 0.38, 
                backgroundImage: src ? `url(${src})` : 'none',
                minWidth: size,
                minHeight: size
            }}
        >
            {!src && (name || '?').charAt(0).toUpperCase()}
        </div>
    );
};

export default Avatar;
