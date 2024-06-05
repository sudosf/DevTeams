import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, switchMap, throwError } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
	providedIn: 'root',
})
export class HttpService {
	errorPipe = (error: any) => {
		if (error instanceof HttpErrorResponse) {
			return throwError(() => `${error.error.message}`);
		} else {
			return throwError(() => `Something went wrong. Please try again later.`);
		}
	};

	constructor(
		private http: HttpClient,
		private configService: ConfigService,
	) {}

	get<T>(path: string): Observable<T> {
		return this.makeEndpoint(path).pipe(
			switchMap((endpoint) => {
				return this.http.get<T>(endpoint, { headers: this.headers });
			}),
			catchError(this.errorPipe),
		);
	}

	post<T>(path: string, body: Object): Observable<T> {
		return this.makeEndpoint(path).pipe(
			switchMap((endpoint) => {
				return this.http.post<T>(endpoint, body, { headers: this.headers });
			}),
			catchError(this.errorPipe),
		);
	}

	patch<T>(path: string, body: Object): Observable<T> {
		return this.makeEndpoint(path).pipe(
			switchMap((endpoint) => {
				return this.http.patch<T>(endpoint, body, { headers: this.headers });
			}),
			catchError(this.errorPipe),
		);
	}

	put<T>(path: string, body: Object): Observable<T> {
		return this.makeEndpoint(path).pipe(
			switchMap((endpoint) => {
				return this.http.put<T>(endpoint, body, { headers: this.headers });
			}),
			catchError(this.errorPipe),
		);
	}

	delete<T>(path: string): Observable<T> {
		return this.makeEndpoint(path).pipe(
			switchMap((endpoint) => {
				return this.http.delete<T>(endpoint, { headers: this.headers });
			}),
			catchError(this.errorPipe),
		);
	}

	private get headers() {
		return {
			'Content-Type': 'application/json',
			// TODO: Inject user token if available
			Authorization: '1',
		};
	}

	private makeEndpoint(path: string): Observable<string> {
		return this.configService.config.pipe(
			map((config) => {
				return `${config.baseApi}/${path}`;
			}),
		);
	}
}
