// 게임 상태 변수
let gameState = {
    score: 0,
    time: 60,
    isPlaying: false,
    gameInterval: null,
    foodInterval: null
};

// 오디오 파일 배열
const audioFiles = {
    good: [
        'sound/Glow3.mp3',
        'sound/thankyou.mp3',
        'sound/good.mp3',
        'sound/oh yes.mp3'
    ],
    bad: [
        'sound/Error3.mp3',
        'sound/andae.mp3',
        'sound/oh no.mp3',
        'sound/sira.mp3'
    ]
};

// 음식 데이터
const foods = {
    healthy: [
        { emoji: '🥗', name: '샐러드', points: 1 },
        { emoji: '🥕', name: '당근', points: 1 },
        { emoji: '🍎', name: '사과', points: 1 },
        { emoji: '🥦', name: '브로콜리', points: 1 },
        { emoji: '🍅', name: '토마토', points: 1 },
        { emoji: '🥬', name: '상추', points: 1 },
        { emoji: '🥒', name: '오이', points: 1 },
        { emoji: '🍊', name: '오렌지', points: 1 },
        { emoji: '🍌', name: '바나나', points: 1 },
        { emoji: '🥝', name: '키위', points: 1 },
        { emoji: '🍓', name: '딸기', points: 1 },
        { emoji: '🍇', name: '포도', points: 1 }
    ],
    unhealthy: [
        { emoji: '🍔', name: '햄버거', points: -1 },
        { emoji: '🍕', name: '피자', points: -1 },
        { emoji: '🍟', name: '감자튀김', points: -1 },
        { emoji: '🍦', name: '아이스크림', points: -1 },
        { emoji: '🍰', name: '케이크', points: -1 },
        { emoji: '🍫', name: '초콜릿', points: -1 },
        { emoji: '🍬', name: '사탕', points: -1 },
        { emoji: '🥤', name: '탄산음료', points: -1 },
        { emoji: '🍺', name: '맥주', points: -1 },
        { emoji: '🍿', name: '팝콘', points: -1 }
    ]
};

// DOM 요소들
const elements = {
    score: document.getElementById('score'),
    time: document.getElementById('time'),
    level: document.getElementById('level'),
    foodContainer: document.getElementById('foodContainer'),
    startBtn: document.getElementById('startBtn'),
    resetBtn: document.getElementById('resetBtn'),
    gameOverModal: document.getElementById('gameOverModal'),
    finalScore: document.getElementById('finalScore'),
    playAgainBtn: document.getElementById('playAgainBtn')
};

// 게임 초기화
function initGame() {
    updateDisplay();
    bindEvents();
}

// 이벤트 바인딩
function bindEvents() {
    elements.startBtn.addEventListener('click', startGame);
    elements.resetBtn.addEventListener('click', resetGame);
    elements.playAgainBtn.addEventListener('click', () => {
        hideModal();
        resetGame();
        startGame();
    });
}

// 게임 시작
function startGame() {
    if (gameState.isPlaying) return;
    
    gameState.isPlaying = true;
    gameState.time = 60;
    gameState.score = 0;
    
    updateDisplay();
    updateButtonStates();
    
    // 음식 생성 시작 (간격 800ms)
    createFood();
    gameState.foodInterval = setInterval(createFood, 800);
    
    // 타이머 시작
    gameState.gameInterval = setInterval(() => {
        gameState.time--;
        updateDisplay();
        
        if (gameState.time <= 0) {
            endGame();
        }
    }, 1000);
}

// 게임 리셋
function resetGame() {
    stopGame();
    gameState.score = 0;
    gameState.time = 60;
    
    clearFoodContainer();
    updateDisplay();
    updateButtonStates();
}

// 게임 종료
function endGame() {
    stopGame();
    showGameOverModal();
}

// 게임 중지
function stopGame() {
    gameState.isPlaying = false;
    
    if (gameState.gameInterval) {
        clearInterval(gameState.gameInterval);
        gameState.gameInterval = null;
    }
    
    if (gameState.foodInterval) {
        clearInterval(gameState.foodInterval);
        gameState.foodInterval = null;
    }
    
    updateButtonStates();
}

// 음식 생성
function createFood() {
    if (!gameState.isPlaying) return;
    
    const foodContainer = elements.foodContainer;
    const containerRect = foodContainer.getBoundingClientRect();
    
    // 랜덤하게 건강한 음식 또는 건강하지 않은 음식 선택
    const isHealthy = Math.random() < 0.7; // 70% 확률로 건강한 음식
    const foodArray = isHealthy ? foods.healthy : foods.unhealthy;
    const food = foodArray[Math.floor(Math.random() * foodArray.length)];
    
    // 음식 요소 생성
    const foodElement = document.createElement('div');
    foodElement.className = `food-item ${isHealthy ? 'healthy' : 'unhealthy'}`;
    foodElement.textContent = food.emoji;
    foodElement.title = food.name;
    
    // 랜덤 위치 설정
    const maxX = containerRect.width - 80;
    const maxY = containerRect.height - 80;
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    
    foodElement.style.left = `${x}px`;
    foodElement.style.top = `${y}px`;
    
    // 클릭 이벤트
    foodElement.addEventListener('click', () => {
        handleFoodClick(foodElement, food);
    });
    
    foodContainer.appendChild(foodElement);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        if (foodElement.parentNode) {
            foodElement.remove();
        }
    }, 3000);
}

// 음식 클릭 처리
function handleFoodClick(foodElement, food) {
    if (!gameState.isPlaying) return;
    
    // 점수 업데이트
    gameState.score += food.points;
    if (gameState.score < 0) gameState.score = 0;
    
    // 포인트 효과 표시
    showPointEffect(foodElement, food.points);
    
    // 클릭된 음식 즉시 제거
    foodElement.remove();
    
    // 디스플레이 업데이트
    updateDisplay();
    
    // 사운드 효과
    playSound(food.points > 0);
}

// 음식을 헬씨 이미지로 이동
function moveFoodToHelsy(foodElement) {
    const helsyImage = document.querySelector('.helsy-image');
    if (!helsyImage) {
        console.log('헬씨 이미지를 찾을 수 없습니다.');
        foodElement.remove();
        return;
    }
    
    // 헬씨 이미지의 위치 가져오기
    const helsyRect = helsyImage.getBoundingClientRect();
    const foodRect = foodElement.getBoundingClientRect();
    
    // 이동할 거리 계산 (헬씨 이미지 중앙으로)
    const targetX = helsyRect.left + helsyRect.width / 2 - foodRect.width / 2;
    const targetY = helsyRect.top + helsyRect.height / 2 - foodRect.height / 2;
    
    console.log('음식 이동 시작:', {
        현재위치: { x: foodRect.left, y: foodRect.top },
        목표위치: { x: targetX, y: targetY },
        헬씨위치: { x: helsyRect.left, y: helsyRect.top }
    });
    
    // 애니메이션을 위한 스타일 설정
    foodElement.style.position = 'fixed';
    foodElement.style.left = `${foodRect.left}px`;
    foodElement.style.top = `${foodRect.top}px`;
    foodElement.style.transition = 'left 0.8s ease-in-out, top 0.8s ease-in-out, transform 0.8s ease-in-out, opacity 0.8s ease-in-out';
    foodElement.style.zIndex = '9999';
    foodElement.style.pointerEvents = 'none';

    // 약간의 딜레이 후 애니메이션 시작
    setTimeout(() => {
        foodElement.style.left = `${targetX}px`;
        foodElement.style.top = `${targetY}px`;
        foodElement.style.transform = 'scale(0.3)';
        foodElement.style.opacity = '0.7';
    }, 10);
    
    // 애니메이션 완료 후 제거
    setTimeout(() => {
        if (foodElement.parentNode) {
            foodElement.remove();
            console.log('음식 이동 완료');
        }
    }, 810);
}

// 포인트 효과 표시
function showPointEffect(element, points) {
    const rect = element.getBoundingClientRect();
    const pointElement = document.createElement('div');
    pointElement.className = 'point-effect';
    pointElement.textContent = points > 0 ? `+${points}` : `${points}`;
    pointElement.style.left = `${rect.left}px`;
    pointElement.style.top = `${rect.top}px`;
    
    document.body.appendChild(pointElement);
    
    setTimeout(() => {
        pointElement.remove();
    }, 1000);
}

// 사운드 재생
function playSound(isGood) {
    try {
        const file = isGood ? 'sound/thankyou.mp3' : 'sound/sira.mp3';
        const audio = new Audio(file);
        audio.currentTime = 0;
        audio.play();
    } catch (error) {
        console.log('사운드 재생 중 오류:', error);
    }
}

// 음식 컨테이너 비우기
function clearFoodContainer() {
    elements.foodContainer.innerHTML = '';
}

// 디스플레이 업데이트
function updateDisplay() {
    elements.score.textContent = gameState.score;
    elements.time.textContent = gameState.time;
}

// 버튼 상태 업데이트
function updateButtonStates() {
    elements.startBtn.disabled = gameState.isPlaying;
    elements.resetBtn.disabled = false;
}

// 게임 오버 모달 표시
function showGameOverModal() {
    elements.finalScore.textContent = gameState.score;
    elements.gameOverModal.style.display = 'block';
}

// 모달 숨기기
function hideModal() {
    elements.gameOverModal.style.display = 'none';
}

// 모달 외부 클릭 시 닫기
window.addEventListener('click', (event) => {
    if (event.target === elements.gameOverModal) {
        hideModal();
    }
});

// 키보드 단축키
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        if (gameState.isPlaying) {
            endGame();
        } else if (!gameState.isPlaying && gameState.score === 0) {
            startGame();
        }
    }
    
    if (event.code === 'KeyR') {
        resetGame();
    }
});

// 페이지 로드 시 게임 초기화
document.addEventListener('DOMContentLoaded', initGame);

// 윈도우 포커스 시 게임 상태 확인
window.addEventListener('focus', () => {
    if (gameState.isPlaying && gameState.time <= 0) {
        // 사용자가 다른 탭에서 돌아왔을 때 게임 종료 상태 유지
        console.log('게임이 종료 상태입니다.');
    }
});

// 게임 통계 (선택사항)
function saveGameStats() {
    const stats = {
        score: gameState.score,
        date: new Date().toISOString()
    };
    
    // 로컬 스토리지에 저장
    const savedStats = JSON.parse(localStorage.getItem('gameStats') || '[]');
    savedStats.push(stats);
    
    // 최근 10개만 유지
    if (savedStats.length > 10) {
        savedStats.splice(0, savedStats.length - 10);
    }
    
    localStorage.setItem('gameStats', JSON.stringify(savedStats));
}

// 게임 종료 시 통계 저장
function endGame() {
    stopGame();
    saveGameStats();
    showGameOverModal();
}

// 게임 시작, 다시 시작 버튼에 Glow3.mp3 재생 추가
function playGlow3() {
    const audio = new Audio('sound/Glow3.mp3');
    audio.currentTime = 0;
    audio.play();
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('startBtn').addEventListener('click', playGlow3);
    document.getElementById('resetBtn').addEventListener('click', playGlow3);
});
