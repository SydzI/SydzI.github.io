(function () {
  /**

   * Icarus 夜间模式 by iMaeGoo
   * https://www.imaegoo.com/
      */

    var isNight = localStorage.getItem('night');
    var nightNav;
    var nightIcon;

  function applyNight(value) {
      if (value.toString() === 'true') {
          document.body.classList.remove('light');
          document.body.classList.add('night');
          // 夜间模式显示太阳图标
          if (nightIcon) {
              nightIcon.classList.remove('fa-moon');
              nightIcon.classList.add('fa-sun');
          }
      } else {
          document.body.classList.remove('night');
          document.body.classList.add('light');
          // 日间模式显示月亮图标
          if (nightIcon) {
              nightIcon.classList.remove('fa-sun');
              nightIcon.classList.add('fa-moon');
          }
      }
  }

  function findNightNav() {
      nightNav = document.getElementById('night-nav');
      nightIcon = document.getElementById('night-icon');
      if (!nightNav || !nightIcon) {
          setTimeout(findNightNav, 100);
      } else {
          nightNav.addEventListener('click', switchNight);
          // 初始化图标
          if (isNight && isNight.toString() === 'true') {
              nightIcon.classList.remove('fa-moon');
              nightIcon.classList.add('fa-sun');
          }
      }
  }

  function switchNight() {
      isNight = isNight ? isNight.toString() !== 'true' : true;
      applyNight(isNight);
      localStorage.setItem('night', isNight);
  }

  findNightNav();
  isNight && applyNight(isNight);
}());