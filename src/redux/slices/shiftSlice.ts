import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ShiftResponse } from "../../types/shift";

interface ShiftState {
    shifts:ShiftResponse[];
    selectedShift:ShiftResponse|null;
}

const initialState : ShiftState = { shifts :[], selectedShift:null };
const shiftSlice = createSlice({
    name:"shift",
    initialState,
    reducers:{ setShifts:(state,action : PayloadAction<ShiftResponse[]>) => { state.shifts = action.payload;},
               setSelectedShift :(state,action : PayloadAction<ShiftResponse | null>) => {state.selectedShift = action.payload ;},
               clearSelectedShift: (state) => { state.selectedShift = null; },
             },

})
export const { setShifts, setSelectedShift, clearSelectedShift,} = shiftSlice.actions;

export default shiftSlice.reducer;