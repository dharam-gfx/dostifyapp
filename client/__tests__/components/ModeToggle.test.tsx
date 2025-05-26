import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, jest } from '@jest/globals';
import ModeToggle from '@/components/theme/ModeToggle';

// Mock next-themes
jest.mock( 'next-themes', () => ( {
    useTheme: () => ( {
        theme: 'light',
        setTheme: jest.fn(),
    } ),
} ) );

// This is a simplified test just to demonstrate Jest setup
describe( 'ModeToggle Component', () => {
    it( 'can be rendered', () => {
        // The actual component uses RadioGroup from Radix UI which can be complex to test
        // This basic test just verifies the component can be rendered
        expect( () => {
            render( <ModeToggle /> );
        } ).not.toThrow();
    } );
} );
