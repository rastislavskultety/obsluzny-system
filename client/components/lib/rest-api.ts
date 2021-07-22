import { NuxtAxiosInstance } from '@nuxtjs/axios';

interface ResBase {
  error?: string;
}

export interface ResCurrentUser extends ResBase {
  username: string;
}

export interface ResUserRegistration extends ResBase {
  sid: string;
}


export interface Quote {
  quote: string;
  author: string;
  genre: string;
}

export interface Quotes {
  [index: number]: Quote;
}

export interface ResQuotes extends ResBase {
  quotes: Quotes,
  serviceCenter: number
}

export async function getCurrentUser(axios: NuxtAxiosInstance): Promise<string> {
  try {
    const result: ResCurrentUser = await axios.$get('users/current');

    return result.username;
  } catch (err) {
    return '';
  };
}
