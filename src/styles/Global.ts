"use client"
import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    font-size: 62.5%;
  }

  img {
        max-width: 100%;
        display: block;
    }

  button {
      background-color: transparent;
      border: none;
      outline: none;
      cursor: pointer
  }

`

export default GlobalStyle;