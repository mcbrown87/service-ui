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
import { connect } from 'react-redux';
import { intlShape, injectIntl, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Manager, Popper, Reference } from 'react-popper';
import { userIdSelector, activeProjectSelector } from 'controllers/user/selectors';
import { debounce } from 'common/utils';
import CompareIcon from 'common/img/compare-inline.svg';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import { GhostButton } from 'components/buttons/ghostButton';
import {
  fetchFiltersConcatAction,
  loadingSelector,
  filtersSelector,
  filtersPaginationSelector,
} from 'controllers/filter';
import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import { filterForCompareSelector, setFilterForCompareAction } from 'controllers/itemsHistory';
import { SearchableFilterList } from 'pages/inside/common/searchableFilterList';
import styles from './compareWithFilterControl.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    userId: userIdSelector(state),
    activeProject: activeProjectSelector(state),
    selectedFilter: filterForCompareSelector(state),
    filters: filtersSelector(state),
    pagination: filtersPaginationSelector(state),
    loading: loadingSelector(state),
  }),
  {
    fetchFiltersConcatAction,
    onChangeActiveFilter: setFilterForCompareAction,
  },
)
@injectIntl
export class CompareWithFilterControl extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loading: PropTypes.bool.isRequired,
    pagination: PropTypes.object.isRequired,
    activeProject: PropTypes.string.isRequired,
    fetchFiltersConcatAction: PropTypes.func.isRequired,
    selectedFilter: PropTypes.object,
    filters: PropTypes.array,
    disabled: PropTypes.bool,
    userId: PropTypes.string,
    onChangeActiveFilter: PropTypes.func,
  };

  static defaultProps = {
    selectedFilter: null,
    filters: [],
    disabled: false,
    userId: '',
    editable: false,
    onChangeActiveFilter: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      page: 1,
      size: 10,
      searchValue: '',
      filterListShown: false,
    };
    this.refNode = null;
    this.controlNode = null;
  }

  componentDidMount() {
    const { page } = this.state;
    document.addEventListener('click', this.handleClickOutside);
    this.fetchFilter({ page });
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }

  getFilterById = (filterId) => this.props.filters.find((elem) => elem.id === Number(filterId));

  handleClickOutside = (e) => {
    if (
      this.controlNode &&
      !this.controlNode.contains(e.target) &&
      this.refNode &&
      !this.refNode.contains(e.target) &&
      this.state.filterListShown
    ) {
      this.setState({ filterListShown: false });
    }
  };

  fetchFilter = ({ page, size, searchValue }) => {
    const { size: stateSize, page: statePage } = this.state;

    let params = {
      [PAGE_KEY]: page || statePage,
      [SIZE_KEY]: size || stateSize,
    };

    if (searchValue) {
      params = { ...params, 'filter.cnt.name': searchValue };
    }

    const concat = page > 1;

    this.props.fetchFiltersConcatAction({ params, concat });
    this.setState({ page: page + 1, searchValue });
  };

  handleSearchValueChange = debounce(
    (value) =>
      // TODO: add callback to track event here
      // this.props.tracking.trackEvent(this.props.eventsInfo.enterSearchParams);
      this.fetchFilter({ page: 1, searchValue: value }),
    300,
  );

  handleFilterListChange = (event) => {
    // TODO: add callback to track event here
    // this.props.tracking.trackEvent(this.props.eventsInfo.chooseFilter);
    const filter = this.getFilterById(event.target.value);
    this.props.onChangeActiveFilter(filter);
    this.toggleFilterList();
  };

  handleFiltersListLoad = () => {
    const { page, searchValue } = this.state;
    const {
      filters,
      pagination: { totalElements, totalPages },
      loading,
    } = this.props;

    if ((filters.length >= totalElements && page >= totalPages) || loading) {
      return;
    }

    this.fetchFilter({ page, searchValue });
  };

  resetActiveFilter = () => {
    this.props.onChangeActiveFilter(null);
  };

  toggleFilterList = () => {
    this.setState({
      filterListShown: !this.state.filterListShown,
    });
  };

  render() {
    const { filters, pagination, selectedFilter, loading, disabled } = this.props;
    const { searchValue, filterListShown } = this.state;

    return (
      <div className={cx('compare-with-filter-control')}>
        {!!selectedFilter && (
          <div className={cx('selected-filter-control')}>
            <span className={cx('selected-filter-name')}>{selectedFilter.name}</span>
            <GhostButton icon={CrossIcon} disabled={disabled} onClick={this.resetActiveFilter} />
          </div>
        )}
        <Manager>
          <Reference>
            {({ ref }) => (
              <div
                ref={(node) => {
                  ref(node);
                  this.refNode = node;
                }}
                onClick={this.toggleFilterList}
              >
                <GhostButton icon={CompareIcon} disabled={disabled}>
                  <FormattedMessage id="Common.compare" defaultMessage="Compare" />
                </GhostButton>
              </div>
            )}
          </Reference>
          {filterListShown && (
            <Popper
              innerRef={(node) => {
                this.controlNode = node;
              }}
              placement="bottom-center"
            >
              {({ ref, style, placement }) => (
                <div
                  className={cx('filter-control')}
                  ref={ref}
                  style={style}
                  data-placement={placement}
                >
                  <SearchableFilterList
                    activeFilter={selectedFilter}
                    searchValue={searchValue}
                    loading={loading}
                    pagination={pagination}
                    onLazyLoad={this.handleFiltersListLoad}
                    onChangeActiveFilter={this.handleFilterListChange}
                    onSearchChange={this.handleSearchValueChange}
                    filters={filters}
                    onEditItem={this.handleEditFilterListItem}
                    filterListCustomClass={cx('filter-list')}
                  />
                </div>
              )}
            </Popper>
          )}
        </Manager>
      </div>
    );
  }
}