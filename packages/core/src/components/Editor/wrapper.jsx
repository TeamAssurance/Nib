import PropTypes from 'prop-types';
import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';

import styled from '@emotion/styled';
import PopupHandler from '../PopupHandler';
import ToolbarHandler from '../ToolbarHandler';
import TopToolbar from '../Toolbar/Top';
import { useConfigContext } from '../../context/config';

import InnerEditor from './editor';
import { StyledWrapper } from './styles';

const Wrapper = props => {
  const [licenseCheckFail, setLicenseCheckFail] = useState(false);
  const editorWrapper = useRef(null);
  const {
    config: { toolbar },
  } = useConfigContext();

  const topToolbarPresent = toolbar.options.indexOf('top') >= 0;
  const { addons } = props;

  useEffect(() => {
    const { licenseKey } = props;
    if (addons)
      axios
        .get('https://licencecheck.herokuapp.com/licenceCheck', {
          licenseKey,
          plugins: addons.map(a => a.name),
        })
        .then(({ data }) => {
          if (data.status === 'FAIL') setLicenseCheckFail(true);
        });
  });

  return (
    <StyledWrapper ref={editorWrapper}>
      {licenseCheckFail && (
        <LicenseAlert>Please get license to use advance plugins !</LicenseAlert>
      )}
      {topToolbarPresent && (
        <TopToolbar editorWrapper={editorWrapper} addons={addons} />
      )}
      <InnerEditor {...props} />
      {/* todo: better name for handler */}
      <PopupHandler editorWrapper={editorWrapper} addons={addons} />
      {/* currently ToolbarHandler is used for addon toolbars only but its use can be extended */}
      {addons && (
        <ToolbarHandler editorWrapper={editorWrapper} plugins={addons} />
      )}
    </StyledWrapper>
  );
};

Wrapper.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  addons: PropTypes.array,
  licenseKey: PropTypes.string,
};

Wrapper.defaultProps = {
  addons: undefined,
  licenseKey: undefined,
};

const LicenseAlert = styled.div`
  width: 100% !important;
  background-color: rgba(213, 0, 0, 0.8) !important;
  height: 30px !important;
  position: absolute !important;
  top: 37px !important;
  color: white !important;
  text-align: center;
  font-size: 18px !important;
  line-height: 1.5;
  z-index: 10;
`;

export default Wrapper;
