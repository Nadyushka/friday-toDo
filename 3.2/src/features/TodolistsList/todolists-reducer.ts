import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {RequestStatusType, setAppStatusAC} from '../../app/app-reducer'
import {handleServerNetworkError} from '../../utils/error-utils'
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {updateTaskTC} from "./tasks-reducer";

const initialState: Array<TodolistDomainType> = []

export const fetchTodolistsTC = createAsyncThunk('toDoList/fetchTodolistsTC_',
    async (param, {dispatch, rejectWithValue}) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        const res = await todolistsAPI.getTodolists()
        try {
            dispatch(setAppStatusAC({status: 'succeeded'}))
            return {todolists: res.data}
        } catch (error) {
            handleServerNetworkError(error, dispatch);
            return rejectWithValue({})
        }
    }
)

export const removeTodolistTC = createAsyncThunk('toDoList/removeTodolistTC',
    async (param: { todolistId: string }, {dispatch, rejectWithValue}) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        dispatch(changeTodolistEntityStatusAC({id: param.todolistId, status: 'loading'}))
        try {
            const res = await todolistsAPI.deleteTodolist(param.todolistId)
            dispatch(setAppStatusAC({status: 'succeeded'}))
            return {todolistId: param.todolistId}
        } catch (e) {
            return rejectWithValue({})
        }
    }
)

export const addTodolistTC = createAsyncThunk('toDoList/addTodolistTC',
    async (param: { title: string }, {dispatch, rejectWithValue}) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        try {
            const res = await todolistsAPI.createTodolist(param.title)
            dispatch(setAppStatusAC({status: 'succeeded'}))
            return {todolist: res.data.data.item}
        } catch (e) {
            return rejectWithValue({})
        }
    }
)

export const changeTodolistTitleTC = createAsyncThunk('toDoList/changeTodolistTitleTC',
    async (param: { id: string, title: string }, {dispatch, rejectWithValue}) => {
        try {
            const res = await todolistsAPI.updateTodolist(param.id, param.title)
            return {id: param.id, title: param.title}
        } catch (e) {
            return rejectWithValue({})
        }
    }
)


const slice = createSlice({
    name: 'todolist',
    initialState: initialState as Array<TodolistDomainType>,
    reducers: {
        // removeTodolistAC: (state, action: PayloadAction<{ id: string }>) => {
        //     const index = state.findIndex(tl => tl.id === action.payload.id)
        //     state.splice(index, 1)
        // },
        // addTodolistAC: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
        //     state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
        // },
        // changeTodolistTitleAC: (state, action: PayloadAction<{ id: string, title: string }>) => {
        //     const index = state.findIndex(tl => tl.id === action.payload.id)
        //     state[index].title = action.payload.title
        // },
        changeTodolistFilterAC: (state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) => {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            state[index].filter = action.payload.filter
        },
        changeTodolistEntityStatusAC: (state, action: PayloadAction<{ id: string, status: RequestStatusType }>) => {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            state[index].entityStatus = action.payload.status
        },
        // setTodolistsAC: (state, action: PayloadAction<{ todolists: Array<TodolistType> }>) => {
        //     return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        // }
    },
    extraReducers: builder => {
        builder.addCase(fetchTodolistsTC.fulfilled, (state, action) => {
            return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        })
        builder.addCase(removeTodolistTC.fulfilled, (state, action) => {
            const index = state.findIndex(tl => tl.id === action.payload.todolistId)
            state.splice(index, 1)
        })
        builder.addCase(addTodolistTC.fulfilled, (state, action) => {
            state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
        })
        builder.addCase(changeTodolistTitleTC.fulfilled, (state, action) => {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            state[index].title = action.payload.title
        })
    }

})

export const todolistsReducer = slice.reducer
export const {changeTodolistFilterAC,changeTodolistEntityStatusAC} = slice.actions

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}

