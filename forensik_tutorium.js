const chapters = ['theory', 'technical', 'artifacts', 'exercises', 'scenario'];

const state = {
    visited: new Set()
};

function switchTab(chapterId) {
    if (!chapters.includes(chapterId)) {
        return;
    }

    document.querySelectorAll('.tab-content').forEach((content) => {
        content.classList.toggle('hidden', content.id !== `content-${chapterId}`);
    });

    document.querySelectorAll('.tab-btn').forEach((button) => {
        const isActive = button.id === `tab-${chapterId}`;
        button.classList.toggle('active-tab', isActive);
        button.setAttribute('aria-selected', String(isActive));
    });

    state.visited.add(chapterId);
    updateProgress();
}

function updateProgress() {
    const percentage = Math.round((state.visited.size / chapters.length) * 100);
    document.getElementById('progress-bar').style.width = `${percentage}%`;
    document.getElementById('progress-text').innerText = `${percentage}% abgeschlossen`;
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tab-btn').forEach((button) => {
        button.setAttribute('aria-selected', String(button.id === 'tab-theory'));
    });
    switchTab('theory');
});
