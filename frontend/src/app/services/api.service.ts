import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpService } from './http.service';
import { WithMessageId, WithTeamId } from '../interfaces';

@Injectable({
	providedIn: 'root',
})
export class ApiService {
	constructor(private httpService: HttpService) {}

	sendMessage(message: string, chatId: number): Observable<number> {
		return this.httpService
			.post<WithMessageId>(`chats/${chatId}/messages/text`, {
				messageText: message,
			})
			.pipe(map((response) => response.messageId));
	}

	// Teams
	createTeam(name: string): Observable<number> {
		return this.httpService
			.post<WithTeamId>(`teams/`, {
				teamName: name,
			})
			.pipe(map((response) => response.teamId));
	}
}
