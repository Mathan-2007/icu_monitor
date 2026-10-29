const SETTINGS_KEY = 'icu-notification-settings';

const defaultSettings = {
  sound: true,
  browser: false
};

export const getNotificationSettings = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return { ...defaultSettings, ...saved };
  } catch {
    return { ...defaultSettings };
  }
};

export const setNotificationSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...defaultSettings, ...settings }));
    return getNotificationSettings();
  } catch {
    return { ...defaultSettings };
  }
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return 'unsupported';

  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';

  const result = await Notification.requestPermission();
  return result;
};

export const notifyUser = ({ title, body, tag = 'icu-monitor' }) => {
  const { browser } = getNotificationSettings();
  if (!browser || !('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    new Notification(title, {
      body,
      tag,
      silent: false
    });
    return true;
  } catch {
    return false;
  }
};

export const playAlertSound = (priority = 'info', enabled = true) => {
  const { sound } = getNotificationSettings();
  if (!enabled || !sound) return false;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;

    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = priority === 'critical' ? 880 : priority === 'high' ? 700 : 540;
    gainNode.gain.value = 0.04;

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + (priority === 'critical' ? 0.35 : 0.18));
    return true;
  } catch {
    return false;
  }
};
