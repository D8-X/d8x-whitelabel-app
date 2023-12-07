import classnames from "classnames";
import { memo, type ChangeEvent, type ReactNode } from "react";

import { Box, InputAdornment, OutlinedInput, Typography } from "@mui/material";

// import { ReactComponent as DecreaseIcon } from "assets/icons/decreaseIcon.svg";
// import { ReactComponent as IncreaseIcon } from "assets/icons/increaseIcon.svg";

import styles from "./ResponsiveInput.module.scss";

interface ResponsiveInputPropsI {
  id: string;
  className?: string;
  inputValue: string | number | null;
  setInputValue: (newValue: string) => void;
  handleInputBlur?: () => void;
  currency: ReactNode | undefined;
  placeholder?: string;
  step?: string;
  min?: number;
  max?: number;
  adornmentAction?: ReactNode;
}

export const ResponsiveInput = memo((props: ResponsiveInputPropsI) => {
  const {
    id,
    className,
    inputValue,
    setInputValue,
    handleInputBlur,
    currency,
    placeholder,
    step = "1",
    min = -1,
    max,
    adornmentAction,
  } = props;

  const handleValueChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = +event.target.value;
    if (value < min) {
      setInputValue(`${min}`);
    } else if (max && value > max) {
      setInputValue(`${max}`);
    } else {
      setInputValue(event.target.value);
    }
  };

  const inputNumeric = inputValue !== null ? +inputValue : null;

  return (
    <Box className={classnames(styles.root, className)}>
      <OutlinedInput
        id={id}
        endAdornment={
          <InputAdornment position="end" className={styles.inputAdornment}>
            <Typography variant="adornment">{currency}</Typography>
            {adornmentAction}
          </InputAdornment>
        }
        inputProps={{ step, min, max }}
        type="number"
        placeholder={placeholder}
        onChange={handleValueChange}
        onBlur={handleInputBlur}
        value={inputNumeric === null ? "" : inputValue}
      />
    </Box>
  );
});
