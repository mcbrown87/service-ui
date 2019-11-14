/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { getTimeDateRangePresets } from 'components/filterEntities';
import { InputTimeDateRange } from 'components/inputs/inputTimeDateRange';
import { HISTORY_DEPTH_CONFIG } from 'controllers/itemsHistory';
import styles from './historyControls.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  depthFilterTitle: {
    id: 'HistoryControls.depthFilterTitle',
    defaultMessage: 'History depth',
  },
  periodTitle: {
    id: 'HistoryControls.periodTitle',
    defaultMessage: 'Period',
  },
});

@injectIntl
export class HistoryControls extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    historyDepth: PropTypes.string,
    period: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    onChangeHistoryDepth: PropTypes.func,
    onChangePeriod: PropTypes.func,
  };

  static defaultProps = {
    historyDepth: HISTORY_DEPTH_CONFIG.defaultValue,
    period: {},
    onChangeHistoryDepth: () => {},
    onChangePeriod: () => {},
  };

  render() {
    const { intl, historyDepth, period, onChangeHistoryDepth, onChangePeriod } = this.props;

    return (
      <div className={cx('history-controls')}>
        <div className={cx('controls-wrapper')}>
          <div className={cx('controls-item')}>
            <p className={cx('control-name')}>{intl.formatMessage(messages.depthFilterTitle)}</p>
            <div className={cx('control-container')}>
              <InputDropdown
                options={HISTORY_DEPTH_CONFIG.options}
                value={historyDepth}
                onChange={onChangeHistoryDepth}
              />
            </div>
          </div>

          <div className={cx('controls-item')}>
            <p className={cx('control-name')}>{intl.formatMessage(messages.periodTitle)}</p>
            <div className={cx('control-container')}>
              <InputTimeDateRange
                presets={getTimeDateRangePresets()}
                onChange={onChangePeriod}
                value={period}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}