/**
 * Created by adam on 18/12/2016.
 */
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { URL } from '../_config/config';  // 'http://next.obudget.org/search';
import { SearchResults } from '../_model/SearchResults';
import { SearchBarType } from 'budgetkey-ng2-components/src/components';

const gtag: any = window['gtag'];

@Injectable()
export class SearchService {

  constructor(private http: Http) {}
  /**
   * search()
   *
   * @param {string} term      - new search term
   * @param {string} startRange
   * @param {string} endRange
   * @param {Number} pageSize  - how many records to return
   * @param {Number} offset - how many records to skip?
   * @param {Array<string>} kindsList - category to query - specific or all
   * @returns {Observable<SearchResults>}
   */

  search(term: string, startRange: string, endRange: string, pageSize: number, offset: number,
         kindsList: Array<string>, filters: any ): Observable<SearchResults> {
    let startTime: Date = new Date(); // update time-stamp
    let joinedkinds = kindsList.join(',');
    if (offset === 0) {
      if (gtag) {
        gtag('event', 'search', {'search_term': term, 'kinds': joinedkinds});
      }
    }
    let url = `${URL}/${joinedkinds}/${encodeURIComponent(term)}/${startRange}/${endRange}/${pageSize}/${offset}`;
    if (filters) {
      filters = JSON.stringify(filters).slice(1, -1);
      url += '?filter=' + encodeURIComponent(filters);
    }
    return this.http
      .get(url)
      .map((r: Response) => {
          let endTime = new Date();
          console.log('req search time: ', (endTime.getTime()  - startTime.getTime()) / 1000, 'sec');
          let ret: SearchResults = r.json();
          ret.term = term;
          ret.displayDocs = joinedkinds;
          ret.offset = offset;
          ret.pageSize = pageSize;
          return ret;
      });
  }

  count(term: string, startRange: string, endRange: string,
        types: SearchBarType[]): Observable<SearchResults> {
    let startTime: Date = new Date(); // update time-stamp
    let url = `${URL}/count/${encodeURIComponent(term)}/${startRange}/${endRange}`;
    let config = types
      .map((t: SearchBarType) => {
        return {
          id: t.id,
          doc_types: t.types,
          filters: t.filters || {}
        };
    });
    let config_param = JSON.stringify(config);
    url += '?config=' + encodeURIComponent(config_param);
    return this.http
      .get(url)
      .map((r: Response) => {
          let endTime = new Date();
          console.log('req count time: ', (endTime.getTime()  - startTime.getTime()) / 1000, 'sec');
          let ret: SearchResults = r.json();
          ret.term = term;
          return ret;
      });
  }

}