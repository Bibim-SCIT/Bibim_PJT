import React from 'react';

// 배경 비디오 파일 import (public 폴더에 video.mp4가 있어야 함)
const BackgroundVideo = () => {
    return (
        <video
            autoPlay
            loop
            muted
            playsInline
            style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: -1,
            }}
        >
            <source src="/video.mp4" type="video/mp4" />
            브라우저가 비디오를 지원하지 않습니다.
        </video>
    );
};

export default BackgroundVideo;
