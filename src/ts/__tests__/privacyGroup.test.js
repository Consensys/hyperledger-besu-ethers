"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var privacyGroup = __importStar(require("../privacyGroup"));
describe('Privacy Group unit tests', function () {
    describe('generate privacy group id', function () {
        test('with one privateFor address', function () {
            var testOptions = {
                privateFrom: 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=',
                privateFor: ['Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='],
            };
            expect(privacyGroup.generatePrivacyGroup(testOptions)).toEqual('DyAOiF/ynpc+JXa2YAGB0bCitSlOMNm+ShmB/7M6C4w=');
        });
        test('with 2 privateFor members', function () {
            var testOptions = {
                privateFrom: 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=',
                privateFor: ['Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs=', 'k2zXEin4Ip/qBGlRkJejnGWdP9cjkK+DAvKNW31L2C8='],
            };
            expect(privacyGroup.generatePrivacyGroup(testOptions)).toEqual('95yIn/OYTZ1xN7SiBX1MdBJv9Bqk6Oq7fy+7XSaInyY=');
        });
        test('with privateFor the privacy group id', function () {
            var testOptions = {
                privateFrom: 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=',
                privateFor: '95yIn/OYTZ1xN7SiBX1MdBJv9Bqk6Oq7fy+7XSaInyY=',
            };
            expect(privacyGroup.generatePrivacyGroup(testOptions)).toEqual('95yIn/OYTZ1xN7SiBX1MdBJv9Bqk6Oq7fy+7XSaInyY=');
        });
    });
    describe('Failed generate privacy group id', function () {
        test.each(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n        reason | privateFrom     | privateFor     | errorRegEx\n        ", " | ", "  | ", "  | ", "\n        ", " | ", "  | ", "  | ", "\n        ", " | ", "  | ", "  | ", "\n        ", " | ", "  | ", "  | ", "\n        ", " | ", "  | ", "  | ", "\n        \n   \n        ", " | ", "  | ", "  | ", "\n        ", " | ", "  | ", "  | ", "\n        ", " | ", "  | ", "  | ", "\n        ", " | ", "  | ", "  | ", "\n        ", " | ", "  | ", "  | ", "\n        ", " | ", "  | ", "  | ", "\n        ", " | ", "  | ", "  | ", "\n        ", " | ", "  | ", "  | ", "\n      "], ["\n        reason | privateFrom     | privateFor     | errorRegEx\n        ", " | ", "  | ", "  | ", "\n        ", " | ", "  | ", "  | ", "\n        ", " | ", "  | ", "  | ", "\n        ", " | ", "  | ", "  | ", "\n        ", " | ", "  | ", "  | ", "\n        \n   \n        ", " | ", "  | ", "  | ", "\n        ", " | ", "  | ", "  | ", "\n        ", " | ", "  | ", "  | ", "\n        ", " | ", "  | ", "  | ", "\n        ", " | ", "  | ", "  | ", "\n        ", " | ", "  | ", "  | ", "\n        ", " | ", "  | ", "  | ", "\n        ", " | ", "  | ", "  | ", "\n      "])), 'privateFor undefined', 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=', undefined, /invalid privateFor/, 'privateFor null', 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=', null, /invalid privateFor/, 'empty privateFor array', 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=', [], /invalid privateFor/, 'privateFor not base64 encoded', 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=', ['0x‌2a8d9b56a0fe9cd94d60be4413bcb721d3a7be27ed8e28b3a6346df874ee141b'], /invalid privateFor/, 'privateFor wrong length', 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=', ['o2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='], /invalid privateFor/, 'privateFrom undefined', undefined, ['Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='], /invalid privateFrom/, 'privateFrom null', null, ['Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='], /invalid privateFrom/, 'privateFrom hex', '0x‌2a8d9b56a0fe9cd94d60be4413bcb721d3a7be27ed8e28b3a6346df874ee141b', ['Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='], /invalid privateFrom/, 'privateFrom too short', '1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=', ['Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='], /invalid privateFrom/, 'privateFrom too long', 'AA1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=', ['Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='], /invalid privateFrom/, 'privateFrom empty string', '', ['Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='], /invalid privateFrom/, 'privateFrom empty array', [], ['Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='], /invalid privateFrom/, 'privateFrom array of address', ['A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo='], ['Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='], /invalid privateFrom/)('$reason when privateFrom $privateFrom and privateFor $privateFor are used', function (_a) {
            var privateFrom = _a.privateFrom, privateFor = _a.privateFor, errorRegEx = _a.errorRegEx;
            expect(function () {
                privacyGroup.generatePrivacyGroup({
                    privateFrom: privateFrom,
                    privateFor: privateFor,
                });
            }).toThrow(errorRegEx);
        });
    });
});
var templateObject_1;
