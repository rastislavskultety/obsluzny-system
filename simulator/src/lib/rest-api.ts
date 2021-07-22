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
