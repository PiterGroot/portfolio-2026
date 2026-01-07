document.addEventListener('DOMContentLoaded', function () {
    const profileImg = document.querySelector('.profile-image img');
    profileImg.addEventListener('click', function () {
        this.classList.remove('shake');
        void this.offsetWidth;
        this.classList.add('shake');
    });
    profileImg.addEventListener('animationend', function () {
        this.classList.remove('shake');
    });
});