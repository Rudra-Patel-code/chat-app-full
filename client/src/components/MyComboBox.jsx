import { Combobox } from "@headlessui/react";
import { useEffect, useState } from "react";
import { BsChevronExpand } from "react-icons/bs";
import { IoCheckmarkSharp } from "react-icons/io5";

const MyComboBox = ({ options, value, onChange, placeholder }) => {
  const [localOptions, setLocalOptions] = useState([]);

  useEffect(() => {
    setLocalOptions(options);
  }, []);

  return (
    <Combobox
      className="w-full"
      as="div"
      value={options.find((o) => o.value === value)}
      onChange={(val) => onChange(val)}
    >
      <div className="relative mt-2">
        <Combobox.Button className={"w-full"}>
          <Combobox.Input
            placeholder={placeholder}
            className="block w-full  rounded-md border-0 py-3 px-4 bg-zinc-700 outline outline-1 outline-zinc-600 text-white placeholder:text-white/70 focus:ring-[1px] focus:ring-white"
            onChange={(e) => {
              setLocalOptions(
                options.filter((op) => op.label.includes(e.target.value))
              );
            }}
            displayValue={(option) => option?.label}
          />
        </Combobox.Button>
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <BsChevronExpand aria-hidden="true" />
        </Combobox.Button>

        {localOptions.length > 0 && (
          <Combobox.Options className="outline outline-[1px] outline-zinc-600 absolute z-10 mt-2 p-2 max-h-60 w-full overflow-auto rounded-2xl bg-zinc-800 text-base shadow-lg ring-opacity-5 focus:outline-none sm:text-sm">
            {localOptions.map((option) => (
              <Combobox.Option
                key={option.value}
                value={option}
                className={({ active }) =>
                  `cursor-pointer relative rounded-xl text-white select-none py-3 pl-3 pr-6 ${
                    active ? " bg-zinc-900" : "text-white"
                  }`
                }
              >
                {({ active, selected }) => (
                  <>
                    <span
                      className={`block line-clamp-1 ${
                        selected ? " text-purple-600" : ""
                      } `}
                    >
                      {option.label}
                    </span>

                    {selected && (
                      <span
                        className={`absolute inset-y-0 right-0 flex items-center pr-4
                          ${active ? " text-white" : "text-purple-600"}
                        `}
                      >
                        <IoCheckmarkSharp className="" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
};

export default MyComboBox;
