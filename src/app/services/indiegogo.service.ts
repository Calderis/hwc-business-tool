import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { IndiegogoOption } from '../class/indiegogoOption';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class IndiegogoService {

  public token: string = '';
  private baseUrl = 'https://api.indiegogo.com/2';
  private headers = new Headers();
  private options: RequestOptions;

  constructor (
    private http: Http) {
  }

  // ————— CRUD —————
  public signin(
    email: string,
    password: string,
    credentialType = 'email',
    grantType = 'password'): Promise<any> {
    const body = { email, password, credentialType, grantType };

    body.credentialType = 'email';
    body.email = email;
    body.grantType = 'password';
    body.password = password;

    return this.cURL('https://auth.indiegogo.com/oauth/token', body);
  }

  // ————— USER INFOS —————
  public userInfos(token: string) {
    return this.cURL(this.baseUrl  + '/me', null, token);
  }

  // ————— GET PROJECT —————
  public getProject(id: number): Promise<any> {
    return this.cURL(this.baseUrl + '/projects/' + id, null, this.token);
  }
  // ————— SEARCH —————
  public search(option: IndiegogoOption): Promise<any> {
    let params = '';
    if (option.search !== undefined) { params += '&title=' + option.search; }
    if (option.category !== undefined) { params += '&category=' + option.category; }
    // popular | countdown | new | most_founded
    if (option.sort !== undefined) { params += '&sort=' + option.sort; }
    if (option.city !== undefined) { params += '&city=' + option.city; }
    if (option.country !== undefined) { params += '&country=CTRY_' + option.country; }
    // open | ended | successful
    if (option.status !== undefined) { params += '&status=' + option.status; }
    return this.cURL(this.baseUrl + '/search/campaigns.json', null, this.token, params);
  }

  // ————— SEARCH —————
  // https://api.indiegogo.com/2/search/campaigns.json?page=1&title=Testouille
  // ————— CATEGORIES —————
  // https://api.indiegogo.com/2/search/campaigns.json
  //?category=Phones%20%26%20Accessories&page=1&sort=popular_all
  // https://api.indiegogo.com/2/campaigns/recommendations.json?city=San%20Francisco
  // https://api.indiegogo.com/2/campaigns/1918821.json

  // ————— DOCUMENTATION —————
  // http://developer.indiegogo.com/docs/search

  private cURL(url: string, body: any, token = '', params = ''): Promise<any> {

    let method = 'POST';
    if (body === null) {
      method = 'GET';
    }
    if (params.length) {
      params = params.replace(/^&/, '?');
    }

    const args = [
      '-X ' + method,
      url,
      "-H 'cache-control: no-cache'",
      "-H 'content-type: application/json'",
      "-H 'Authorization: Bearer " + token + "'",
      "-H 'X-Api-Token: e88bd0a00305bfdfb18003a75665643b'",
      "-d '" + JSON.stringify(body) + "'"
    ].join(' ');

    let promise = new Promise((resolve, reject) => {
      childProcess.exec('curl ' + args, (err, stdout, stderr) => {
        if (err) {
          reject(err);
        }
        resolve(JSON.parse(stdout));
      });
    });
    return promise;
  }
}
