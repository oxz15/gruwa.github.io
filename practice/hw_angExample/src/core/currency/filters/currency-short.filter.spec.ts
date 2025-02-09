import {cadNoDataSymbol} from '../../cadreon.const';

export default (ngModule) => {
  describe(ngModule.name, () => {
    describe('filters', () => {
      describe('cadCurrencyShort', () => {
        let filter = null;

        const dash = cadNoDataSymbol;

        beforeEach(() => {
          angular.mock.module(ngModule.name);
          angular.mock.inject((_$filter_) => {
            filter = _$filter_('cadCurrencyShort');
          });
        });

        it('should be defined', () => {
          expect(filter).to.exist;
        });

        it('should pass back input param if it\'s not number', () => {
          expect(filter(undefined, 'USD', 'CODE')).to.equal(dash);
        });

        it('should pass back input param if it\'s not number2', () => {
          expect(filter('test', 'USD', 'CODE')).to.equal(dash);
        });

        it('currency presentation with code', () => {
          expect(filter(1234, 'USD', 'CODE', 2, 2)).to.equal('USD1.23K');
        });

        it('currency presentation with sign', () => {
          expect(filter(678.23123, 'USD', 'SIGN', 2, 2)).to.equal('$678.23');
        });

        it('currency presentation for negative value', () => {
          expect(filter(-0.1, 'USD', 'SIGN')).to.equal('-$0.10');
          expect(filter(-0.1, 'USD', 'CODE')).to.equal('-USD0.10');
        });

        it('handle unknown currency', () => {
          expect(filter(12346, 'pum-purum-pum-pum')).to.equal('12K');
        });
      });
    });
  });
};
