import { darkTheme, type GlobalThemeOverrides } from 'naive-ui'

export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#2080f0',
    primaryColorHover: '#4098fc',
    primaryColorPressed: '#1060c9',
    primaryColorSuppl: '#4098fc',
    successColor: '#18a058',
    successColorHover: '#36ad6a',
    successColorPressed: '#0c7a3d',
    warningColor: '#f0a020',
    warningColorHover: '#fcb040',
    warningColorPressed: '#c97c00',
    errorColor: '#d03050',
    errorColorHover: '#de576d',
    errorColorPressed: '#ab1f3b',
    infoColor: '#2080f0',
    infoColorHover: '#4098fc',
    infoColorPressed: '#1060c9',
    borderRadius: '6px',
  },
}

export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#4098fc',
    primaryColorHover: '#60b0ff',
    primaryColorPressed: '#2080f0',
    primaryColorSuppl: '#60b0ff',
    successColor: '#63e2b7',
    successColorHover: '#7fe7c4',
    successColorPressed: '#5acea7',
    warningColor: '#fcb040',
    warningColorHover: '#fcd070',
    warningColorPressed: '#f0a020',
    errorColor: '#de576d',
    errorColorHover: '#e8808f',
    errorColorPressed: '#d03050',
    infoColor: '#4098fc',
    infoColorHover: '#60b0ff',
    infoColorPressed: '#2080f0',
    borderRadius: '6px',
  },
}

export { darkTheme }
