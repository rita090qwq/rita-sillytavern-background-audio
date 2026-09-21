(() => {
    const AUDIO_ID = 'st-keepalive-audio';
    const FLOAT_ID = 'st-keepalive-float';
    const PANEL_ID = 'st-keepalive-settings';
    const BUTTON_ID = 'st-keepalive-toggle';
    const STATUS_ID = 'st-keepalive-status';
    let audio = null;

    function makeAudioData() {
        const rate = 8000;
        const seconds = 2;
        const samples = rate * seconds;
        const buffer = new ArrayBuffer(44 + samples * 2);
        const view = new DataView(buffer);
        const text = (offset, value) => { for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i)); };
        text(0, 'RIFF');
        view.setUint32(4, 36 + samples * 2, true);
        text(8, 'WAVE');
        text(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, rate, true);
        view.setUint32(28, rate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        text(36, 'data');
        view.setUint32(40, samples * 2, true);
        for (let i = 0; i < samples; i++) {
            const sample = Math.round(Math.sin(2 * Math.PI * 220 * i / rate) * 8);
            view.setInt16(44 + i * 2, sample, true);
        }
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        return 'data:audio/wav;base64,' + btoa(binary);
    }

    function setState(running, message) {
        document.querySelectorAll('#' + BUTTON_ID).forEach(button => {
            button.textContent = running ? '🔊 保活中' : '🔇 开启保活';
            button.setAttribute('aria-pressed', String(running));
        });
        document.querySelectorAll('#' + STATUS_ID).forEach(status => {
            status.textContent = message || (running ? '已开启：切换到其他 App 后会继续播放极低音量背景音频。' : '未开启');
            status.classList.toggle('st-keepalive-on', running);
        });
    }

    function toggle() {
        if (audio) {
            audio.pause();
            audio.remove();
            audio = null;
            setState(false);
            return;
        }
        audio = document.createElement('audio');
        audio.id = AUDIO_ID;
        audio.loop = true;
        audio.preload = 'auto';
        audio.src = makeAudioData();
        audio.volume = 0.01;
        audio.setAttribute('playsinline', '');
        audio.style.display = 'none';
        document.body.appendChild(audio);
        audio.play().then(() => {
            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({ title: '酒馆后台保活', artist: 'SillyTavern', album: '后台音频' });
                navigator.mediaSession.setActionHandler('play', () => audio && audio.play());
                navigator.mediaSession.setActionHandler('pause', () => audio && audio.pause());
            }
            setState(true);
        }).catch(() => {
            audio.remove();
            audio = null;
            setState(false, '请点击一次按钮允许播放音频。');
        });
    }

    function panelMarkup() {
        const panel = document.createElement('div');
        panel.id = PANEL_ID;
        panel.className = 'extension_container';
        panel.innerHTML = '<div class="inline-drawer"><div class="inline-drawer-toggle inline-drawer-header"><b>后台保活音频</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div></div><div class="inline-drawer-content"><div class="st-keepalive-help">用于切换到其他 App 时尽量保持酒馆请求不中断。首次使用请点击开启。</div><button id="' + BUTTON_ID + '" class="menu_button" type="button">🔇 开启保活</button><span id="' + STATUS_ID + '" class="st-keepalive-status">未开启</span></div></div>';
        return panel;
    }

    function addPanel() {
        if (document.getElementById(PANEL_ID)) return true;
        const root = document.getElementById('extensions_settings2') || document.getElementById('extensions_settings');
        if (!root) return false;
        const panel = panelMarkup();
        root.appendChild(panel);
        panel.querySelector('#' + BUTTON_ID).addEventListener('click', toggle);
        return true;
    }

    function addFloatingButton() {
        if (document.getElementById(FLOAT_ID)) return;
        const wrap = document.createElement('div');
        wrap.id = FLOAT_ID;
        wrap.innerHTML = '<button id="' + BUTTON_ID + '-float" type="button" aria-label="后台保活">🔇 保活</button>';
        document.body.appendChild(wrap);
        wrap.querySelector('button').addEventListener('click', toggle);
    }

    function boot() {
        addPanel();
        addFloatingButton();
        const timer = setInterval(() => { if (addPanel()) clearInterval(timer); }, 1000);
        setTimeout(() => clearInterval(timer), 15000);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();
})();
