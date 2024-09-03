class ApiService {
  constructor(url, endPoints = {}) {
    this.apiUrl = url;

    this.endPoints = endPoints;
  }

  async postData(url, data = {}, token = null) {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : undefined,
    };
    const response = await fetch(this.apiUrl + url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return this.parseJSON(response);
  }

  async getData(url, token = null) {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : undefined,
    };
    const response = await fetch(this.apiUrl + url, {
      method: 'GET',
      headers,
    });
    return this.parseJSON(response);
  }

  async deleteData(url, data = {}, token = null) {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : undefined,
    };
    const response = await fetch(this.apiUrl + url, {
      method: 'DELETE',
      headers,
      body: JSON.stringify(data),
    });
    return this.parseJSON(response);
  }

  async putData(url, data = {}, token = null) {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : undefined,
    };
    const response = await fetch(this.apiUrl + url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return this.parseJSON(response);
  }

  async postFile(url, file, data = {}, token = null) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('json', JSON.stringify(data));
    const headers = {
      Authorization: token ? `Bearer ${token}` : undefined,
    };
    const response = await fetch(this.apiUrl + url, {
      method: 'POST',
      headers,
      body: formData,
    });
    return this.parseJSON(response);
  }

  async putFile(url, file, data = {}, token = null) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('json', JSON.stringify(data));
    const headers = {
      Authorization: token ? `Bearer ${token}` : undefined,
    };
    const response = await fetch(this.apiUrl + url, {
      method: 'PUT',
      headers,
      body: formData,
    });
    console.log(response);
    return this.parseJSON(response);
  }

  // eslint-disable-next-line class-methods-use-this
  async parseJSON(response) {
    const jsonResponse = await response.json();
    return {
      status: response.status,
      ok: response.ok,
      json: jsonResponse,
    };
  }
}

window.ApiService = ApiService;
