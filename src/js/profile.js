import {api, renderCartNumber} from './app.js';

window.addEventListener('load', function () {
  renderCartNumber();
});

async function getProfile(body) {
  const profile = await fetch(`${api}/user/signin`, {
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
    method: 'POST',
    mode: 'cors',
  })
    .then((res) => res.json())
    .catch((err) => console.error(err));
  return profile;
}

async function renderProfile(access_token) {
  const body = {
    provider: 'facebook',
    access_token: access_token,
  };
  const profile = await getProfile(body);
  const {name, email, picture} = profile.data.user;

  const profile_section = document.getElementById('profile');
  const div = document.createElement('div');

  const img = document.createElement('img');
  img.src = picture;
  img.alt = 'photo';
  div.appendChild(img);

  const p_name = document.createElement('p');
  p_name.append(name);
  div.appendChild(p_name);

  const p_email = document.createElement('p');
  p_email.append(email);
  div.appendChild(p_email);

  const button = document.createElement('button');
  button.append('Log Out');
  button.onclick = () => {
    // eslint-disable-next-line no-undef
    FB.logout();
    window.location.href = './index.html';
  };
  div.appendChild(button);
  profile_section.appendChild(div);
}

export {renderProfile};
