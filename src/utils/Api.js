export default class Api {
  constructor(config) {
    this._url = config.url;
  }

  async sendRequest(requestOptions) {
    try {
      const response = await fetch(this._url, requestOptions);
      return this._handleResponse(response);
    } catch (error) {
      console.error('Error:', error.message);
    }
  }

  _handleResponse(res) {
    if (res.ok) {
      return res.json();
    } else {
      return Promise.reject(`Ошибка ${res.status}`);
    }
  }
}
