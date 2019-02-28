import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { FieldProvider } from 'components/fields/fieldProvider';
import { STATS_TOTAL } from 'common/constants/statistics';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { validate } from 'common/utils';
import { getWidgetModeOptions } from './utils/getWidgetModeOptions';
import { ITEMS_INPUT_WIDTH } from './constants';
import { FiltersControl, InputControl, TogglerControl } from './controls';

const DEFAULT_ITEMS_COUNT = '50';
const messages = defineMessages({
  ItemsFieldLabel: {
    id: 'TestCasesGrowthTrendControls.ItemsFieldLabel',
    defaultMessage: 'Items',
  },
  ItemsValidationError: {
    id: 'TestCasesGrowthTrendControls.ItemsValidationError',
    defaultMessage: 'Items count should have value from 1 to 150',
  },
});
const validators = {
  items: (formatMessage) => (value) =>
    (!value || !validate.inRangeValidate(value, 1, 150)) &&
    formatMessage(messages.ItemsValidationError),
};

@injectIntl
export class TestCasesGrowthTrendControls extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    initializeControlsForm: PropTypes.func.isRequired,
    formAppearance: PropTypes.object.isRequired,
    onFormAppearanceChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const { widgetSettings, initializeControlsForm } = props;
    initializeControlsForm({
      contentParameters: widgetSettings.contentParameters || {
        contentFields: [STATS_TOTAL],
        itemsCount: DEFAULT_ITEMS_COUNT,
        widgetOptions: {
          timeline: MODES_VALUES[CHART_MODES.LAUNCH_MODE],
        },
      },
    });
  }

  parseItems = (value) =>
    value.length < 4 ? value : this.props.widgetSettings.contentParameters.itemsCount;

  formatFilterValue = (value) => value && value[0];
  parseFilterValue = (value) => value && [value];

  render() {
    const {
      intl: { formatMessage },
      formAppearance,
      onFormAppearanceChange,
    } = this.props;

    return (
      <Fragment>
        <FieldProvider
          name="filterIds"
          parse={this.parseFilterValue}
          format={this.formatFilterValue}
        >
          <FiltersControl
            formAppearance={formAppearance}
            onFormAppearanceChange={onFormAppearanceChange}
          />
        </FieldProvider>
        {!formAppearance.isMainControlsLocked && (
          <Fragment>
            <FieldProvider
              name="contentParameters.itemsCount"
              validate={validators.items(formatMessage)}
              parse={this.parseItems}
            >
              <InputControl
                fieldLabel={formatMessage(messages.ItemsFieldLabel)}
                inputWidth={ITEMS_INPUT_WIDTH}
                type="number"
              />
            </FieldProvider>
            <FieldProvider name="contentParameters.widgetOptions.timeline">
              <TogglerControl
                fieldLabel=" "
                items={getWidgetModeOptions(
                  [CHART_MODES.LAUNCH_MODE, CHART_MODES.TIMELINE_MODE],
                  formatMessage,
                )}
              />
            </FieldProvider>
          </Fragment>
        )}
      </Fragment>
    );
  }
}