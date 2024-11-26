import ky from 'ky';

export const api = ky.extend({
    hooks: {
      beforeRequest: [
        request => {
          request.headers.set('Authorization', `Bearer ${localStorage.getItem('jwt')}`)
        }
      ]
    }
  });