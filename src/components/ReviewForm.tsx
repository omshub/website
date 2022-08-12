import { Button, SelectChangeEvent, TextField } from "@mui/material";
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Rating from '@mui/material/Rating';
import Select from '@mui/material/Select';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Typography from '@mui/material/Typography';
import { ChangeEvent, SyntheticEvent, useState } from 'react';
interface ReviewFormState {
    year: string,
    semester: string,
    overall: number,
    difficulty: number,
}

const ReviewForm: any = (props:any) => {
    // const {user} = useAuth()
    const {courseData,handleReviewModalClose} = props
    const yearRange = getYearRange()
    const [reviewValues, setReviewValues] = useState<ReviewFormState>({
        year: `${(new Date()).getFullYear()}`,
        semester: '',
        overall: 3,
        difficulty: 3,
    });

    const handleChange = (prop: keyof ReviewFormState) => (event: ChangeEvent<HTMLInputElement> | SelectChangeEvent<string>) => {
        console.log(reviewValues)
        setReviewValues({ ...reviewValues, [prop]: event.target.value });
    };

    const handleRating = (prop: keyof ReviewFormState) => (event:SyntheticEvent, value: number | null) => {
        console.log(reviewValues)
        setReviewValues({ ...reviewValues, [prop]: value });
    };
    
    return (
        <form>
            <Grid container
                direction='row'
                rowSpacing={4}
                justifyContent='center'
                sx={{px:5,py:10}}>
                <Typography variant="h6">{`Add Review for ${courseData.courseId}: ${courseData.name}`}</Typography>
                <Grid item xs={12} lg={12} >
                    <TextField
                    disabled
                    fullWidth
                    id="outlined-disabled"
                    label="Course Name"
                    defaultValue={courseData.courseId}
                    />
                </Grid>
                <Grid item xs={12} lg={12}>
                    <FormControl fullWidth>
                        <InputLabel id="test-select-label">Semester</InputLabel>
                        <Select
                            label="Semester"
                            value={reviewValues.semester}
                            onChange={handleChange('semester')}
                            >
                            <MenuItem value={1}>Spring</MenuItem>
                            <MenuItem value={2}>Summer</MenuItem>
                            <MenuItem value={3}>Fall</MenuItem>
                        </Select>
                    </FormControl>
                </Grid> 
                <Grid item xs={12} lg={12}>
                    <FormControl fullWidth>
                        <InputLabel id="test-select-label">Year</InputLabel>
                        <Select
                            label="Year"
                            value={reviewValues.year}
                            onChange={handleChange('year')}
                            >
                            {yearRange.map((year)=>{
                                return(
                                    <MenuItem key={year} value={year}>
                                        <>{year}</>
                                    </MenuItem>
                                )
                            })}
                        </Select>
                    </FormControl>
                </Grid> 
                <Grid item xs={12} lg={12}>
                    <TextField
                        type="number"
                        label="Workload Selection"
                        defaultValue={'21'}
                        InputProps={{
                            endAdornment:<InputAdornment position="end">hr/wk</InputAdornment>
                        }}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} lg={6}>
                    <Typography component="legend">Difficulty</Typography>
                    <Rating
                    name="Difficulty Selection"
                    value={reviewValues.difficulty}
                    onChange={handleRating('difficulty')}
                    sx={{width:'100%'}}
                    size="large"
                    />
                </Grid> 
                <Grid item xs={12} lg={6}>
                    <Typography component="legend">Overall</Typography>
                    <Rating
                    name="Overall Selection"
                    value={reviewValues.overall}
                    onChange={handleRating('overall')}
                    sx={{width:'100%'}}
                    size="large"
                    />
                </Grid> 
                <Grid item xs={12} lg={12}>
                    <TextareaAutosize
                        aria-label="Review Body"
                        minRows={5}
                        style={{ width: '100%' }}
                    />
                </Grid>
            <Button sx={{textAlign:'right',my:5}} onClick={handleReviewModalClose}>Submit</Button>
            </Grid>
        </form>
    )
}

const getYearRange = () => {
    const currentYear = (new Date()).getFullYear()
    const programStart = 2013
    const limitYear = 5
    return Array.from({ length: (currentYear - programStart - limitYear) }, (_, i) => currentYear + (i * -1))
}
export default ReviewForm