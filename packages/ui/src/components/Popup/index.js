import PropTypes from "prop-types";
import React, { Component } from "react";
import styled from "@emotion/styled";

import Closeable from "../Closeable";

const ARROW_HEIGHT = 6;
const ARROW_MIN_DISTANCE = 10;
const BLOCK_HEIGHT = 20;
const MIN_LEFT = 2;
const POPUP_DISTANCE_FROM_BLOCK = 1;

const isSamePos = (oldPos, newPos) => {
  if (!oldPos) return false;
  if (
    oldPos.height !== newPos.height ||
    oldPos.left !== newPos.left ||
    oldPos.offsetTop !== newPos.offsetTop ||
    oldPos.width !== newPos.width
  )
    return false;
  return true;
};

// Note: current left alignment does not take care of padding of section,
// this can be improved in future.
const getPosition = (marker, popupElm, editorWrapper) => {
  const markerDim = marker.getBoundingClientRect();
  const wrapperDim = editorWrapper.getBoundingClientRect();
  const { width: popupWidth = 0, height: popupHeight = 0 } = popupElm
    ? popupElm.getBoundingClientRect()
    : {};

  let arrowDir = "TOP";
  // Finding left offset of popup
  let left = markerDim.left - wrapperDim.left;
  // Center aligning popup on marker element
  left += (markerDim.width - popupWidth) / 2;

  let arrowLeft;
  if (left < 3) {
    arrowLeft = left + ARROW_MIN_DISTANCE;
    left = MIN_LEFT;
  } else if (left + popupWidth > wrapperDim.width) {
    arrowLeft = left + popupWidth - wrapperDim.width;
    left = wrapperDim.width - popupWidth;
    if (left < MIN_LEFT) left = MIN_LEFT;
  }

  let top =
    markerDim.y -
    wrapperDim.y +
    (markerDim.height || BLOCK_HEIGHT) +
    POPUP_DISTANCE_FROM_BLOCK +
    ARROW_HEIGHT;
  if (top + popupHeight > wrapperDim.height) {
    const newTop =
      markerDim.y -
      wrapperDim.y -
      ARROW_HEIGHT -
      popupHeight -
      POPUP_DISTANCE_FROM_BLOCK;
    if (newTop > 0) {
      arrowDir = "BOTTOM";
      top = newTop;
    }
  }

  return {
    popupPosition: { top, left },
    arrowPosition: { left: arrowLeft, dir: arrowDir }
  };
};

class Popup extends Component {
  state = { popupPosition: { top: 0 }, arrowPosition: { dir: "TOP" } };

  componentDidMount() {
    const { marker, editorWrapper, wrapperRef } = this.props;
    if (marker) {
      this.setState({
        ...getPosition(marker, wrapperRef.current, editorWrapper.current)
      });
    }
  }

  componentDidUpdate() {
    const { marker, editorWrapper, wrapperRef } = this.props;
    const { popupPosition } = this.state;
    if (!marker) return;
    const oldPos = this.markerPos;
    const markerDim = marker.getBoundingClientRect();
    this.markerPos = {
      height: markerDim.height,
      left: markerDim.left,
      offsetTop: marker.offsetTop,
      width: markerDim.width
    };
    if (isSamePos(oldPos, this.markerPos) && popupPosition) return;
    // eslint-disable-next-line react/no-did-update-set-state
    this.setState({
      ...getPosition(marker, wrapperRef.current, editorWrapper.current)
    });
  }

  render() {
    const { render, marker, wrapperRef } = this.props;
    if (!marker) return null;
    const { popupPosition, arrowPosition } = this.state;

    return (
      <Wrapper ref={wrapperRef} style={popupPosition} marker={marker}>
        {arrowPosition.dir === "TOP" ? (
          <ArrowTop left={arrowPosition.left} />
        ) : (
          <ArrowBottom left={arrowPosition.left} />
        )}
        {render()}
      </Wrapper>
    );
  }
}

Popup.propTypes = {
  wrapperRef: PropTypes.shape({
    current: PropTypes.object
  }).isRequired,
  editorWrapper: PropTypes.shape({
    current: PropTypes.object
  }).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  marker: PropTypes.object.isRequired,
  render: PropTypes.func.isRequired
};

export default Closeable(Popup);

const Wrapper = styled.div(
  { position: "absolute", padding: "4px 4px 6px 4px;" },
  ({ theme: { constants, popup } }) => ({
    zIndex: 1,

    backgroundColor: constants.color.background.primary,
    color: constants.color.text.primary,

    border: constants.border.primary,
    borderRadius: constants.borderRadius.small,
    boxShadow: constants.boxShadow.primary,

    ":focus": {
      outline: "none"
    },

    ...popup.wrapper({ theme: constants })
  })
);

const ArrowTop = styled.div(
  { position: "absolute", transform: "rotate(45deg)" },
  ({ theme: { constants, popup }, left = 0 }) => ({
    background: constants.color.background.primary,
    borderLeft: constants.border.primary,
    borderTop: constants.border.primary,

    height: 10,
    left: `calc(50% + ${left - ARROW_HEIGHT}px)`,
    top: -6,
    width: 10,

    ...popup.arrowTop({ theme: constants })
  })
);

const ArrowBottom = styled.div(
  {
    position: "absolute",
    bottom: -6,
    width: 10,
    transform: "rotate(45deg)"
  },
  ({ theme: { constants, popup }, left = 0 }) => ({
    background: constants.color.background.primary,
    borderRight: constants.border.primary,
    borderBottom: constants.border.primary,

    height: 10,
    left: `calc(50% + ${left - ARROW_HEIGHT}px)`,

    ...popup.arrowBottom({ theme: constants })
  })
);
