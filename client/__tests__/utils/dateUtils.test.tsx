import { describe, expect, it } from '@jest/globals';
import { formatMessageTime } from '@/utils/dateUtils';

describe( 'Date Utils', () => {
    describe( 'formatMessageTime', () => {
        it( 'formats time correctly', () => {
            const testDate = new Date( '2025-05-26T14:30:00' );
            const formattedTime = formatMessageTime( testDate );

            // Note: This may need adjustment based on your locale settings
            // We're just testing that it returns a string that contains numbers and a separator
            expect( typeof formattedTime ).toBe( 'string' );
            expect( formattedTime ).toMatch( /\d+[:\.]\d+/ ); // Match digits with a separator between
        } );
    } );
} );
