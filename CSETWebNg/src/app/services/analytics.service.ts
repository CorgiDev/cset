////////////////////////////////
//
//   Copyright 2021 Battelle Energy Alliance, LLC
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in all
//  copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//  SOFTWARE.
//
////////////////////////////////
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ConfigService } from './config.service';


@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl: string;
  private analyticsUrl: string;
  public headers = {
    headers: new HttpHeaders().set('Content-Type', 'application/json'),
    params: new HttpParams()
  };



  constructor(private http: HttpClient, private configSvc: ConfigService) {
    this.apiUrl = this.configSvc.apiUrl + "analytics/";
    this.analyticsUrl = this.configSvc.analyticsUrl +"api/";
    
  }
  
  getAnalytics():any {
    return this.http.get(this.apiUrl+'getAnalytics');
  }

  getAnalyticsToken(username, password): any {
    return this.http.post(
      this.analyticsUrl + 'auth/signin', {username, password}, this.headers
    );
  }

  postAnalyticsWithoutLogin(analytics):any{
    return this.http.post(
      this.analyticsUrl + 'Analytics/postAnalyticsAnonymously', analytics, this.headers
    );
  }

  postAnalyticsWithLogin(analytics, token):any{
    let header: HttpHeaders = new HttpHeaders();
    header = header.append('Content-Type', 'application/json');
    header = header.append("Authorization", "Bearer " + token);

    let params: HttpParams = new HttpParams();

    return this.http.post(
      this.analyticsUrl + 'Analytics/postAnalytics', analytics, {headers: header, params}
    );
  }

  pingAnalyticsService():any{
    return this.http.get(this.analyticsUrl+'ping/GetPing');
  }
}
