import { keyframes } from "styled-components";

/**
 * @Keyframes
 * css animation keyframes
 */

export const spin = keyframes`
 0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

export const indeterminateAnimation = keyframes`
  0% {
    left: -40%;
    width: 40%;
  }
  50% {
    left: 20%;
    width: 60%;
  }
  100% {
    left: 100%;
    width: 40%;
  }
`;
export const wave = keyframes`
50%,
  75% {
    transform: scale(2.5);
  }
  80%,
  100% {
    opacity: 0;
  }
`;
export const circularIndeterminate = keyframes`
     0% {
      stroke-dasharray: 1, 200;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 100, 200;
      stroke-dashoffset: -15px;
    }
    100% {
      stroke-dasharray: 100, 200;
      stroke-dashoffset: -125px;
    }
`;

export const fadeInUp = keyframes`
  0% {
    transform: translateY(12px);
    opacity: 0;
  }
  100% {
    transform: translateY(0px);
    opacity: 1;
  }
`;

export const popover = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.92);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;
