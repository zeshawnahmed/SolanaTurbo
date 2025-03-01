import { FC } from "react";

//INTERNAL IMPORT
import { Input } from "../index";

export const InputView: FC = ({ placeholder, name, clickhandle }) => {
  return (
    <div class="mb-4">
      <label
        for="input-label"
        class="text-base/normal text-default-200 mb-2 block font-semibold"
      >
        {name}
      </label>
      <input
        type="text"
        id="input-label"
        onChange={clickhandle}
        class="border-default-200 block w-full rounded border-white/10 bg-transparent py-1.5 px-3 text-white/80 focus:border-white/25 focus:ring-transparent"
        placeholder={placeholder}
      />
    </div>
  );
};
