import {facebook_app} from './key.js';
import {renderProfile} from './profile.js';

(function (d, s, id) {
  let js,
    fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  js = d.createElement(s);
  js.id = id;
  js.src = 'https://connect.facebook.net/en_US/sdk.js';
  fjs.parentNode.insertBefore(js, fjs);
})(document, 'script', 'facebook-jssdk');

window.fbAsyncInit = function () {
  // eslint-disable-next-line no-undef
  FB.init({
    appId: facebook_app.id,
    autoLogAppEvents: true,
    xfbml: true,
    version: facebook_app.version,
  });

  if (window.location.href.includes('profile.html')) {
    // eslint-disable-next-line no-undef
    FB.getLoginStatus(function (response) {
      if (response.status === 'connected') {
        renderProfile(response.authResponse.accessToken);
      } else {
        window.location.href = './index.html';
      }
    }, true);
  } else {
    const login_button = document.getElementById('member');
    login_button.onclick = () => {
      // eslint-disable-next-line no-undef
      FB.getLoginStatus(function (response) {
        if (response.status === 'connected') {
          window.location.href = './profile.html';
        } else {
          // eslint-disable-next-line no-undef
          FB.login(function () {}, {
            scope: 'public_profile,email',
            return_scopes: true,
          });
        }
      }, true);
    };
  }
};
