/** VHF radio lesson: hub card and the practice radio (radio.mteke.com) wrapper. The lesson text lives in games/rya/lessons. */
export const radioEn = {
  'hub.section.communication': 'Communication',
  'game.vhf.title': 'VHF Radio',
  'game.vhf.desc': 'Channels, procedure words, routine and distress calls and DSC, then practise live with other sailors on the VHF practice radio.',
  'vhf.practice.title': 'Live VHF practice radio',
  'vhf.practice.online': 'Online',
  'vhf.practice.intro': 'Join an exercise with the same code as your partner, pick a role and hold PUSH TO TALK to speak.',
  'vhf.practice.locked': 'Sign in with any Google account to open the radio.',
  'vhf.practice.signIn': 'The practice radio is shared with other sailors, so only signed-in users can open it. Others only see the vessel or station name you choose, never your Google name.',
  'vhf.practice.signInButton': 'Sign in with Google',
  'vhf.practice.unconfigured': 'Sign-in is not available on this copy of the site.',
  'vhf.practice.loading': 'Checking sign-in…',
  'vhf.practice.signedInAs': 'Signed in as {email}.',
  'vhf.practice.signOut': 'Sign out',
  'vhf.practice.newWindow': 'Open in a new window',
  'vhf.practice.rules': 'Be kind on air and keep it about sailing; abusive use gets an account blocked. Use headphones to avoid echo.',
}

export type RadioMessages = Record<keyof typeof radioEn, string>
