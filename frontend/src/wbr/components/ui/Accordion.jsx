import { useId, useState } from "react";
import Icon from "./Icon";
import Glass from "./Glass";

/**
 * FAQ / disclosure accordion — mobile-first stacked glass rows.
 */
export default function Accordion({ items }) {
  const [openId, setOpenId] = useState(null);
  const baseId = useId();

  return (
    <div className="accordion">
      {items.map((item, i) => {
        const id = `${baseId}-${i}`;
        const open = openId === id;
        return (
          <Glass key={id} className={`accordion-item${open ? " open" : ""}`}>
            <button
              type="button"
              className="accordion-trigger"
              aria-expanded={open}
              aria-controls={`${id}-panel`}
              id={`${id}-trigger`}
              onClick={() => setOpenId(open ? null : id)}
            >
              <span>{item.q}</span>
              <Icon name="chevronDown" size={18} className="accordion-chevron" />
            </button>
            <div
              id={`${id}-panel`}
              role="region"
              aria-labelledby={`${id}-trigger`}
              className="accordion-panel"
              hidden={!open}
            >
              <p>{item.a}</p>
            </div>
          </Glass>
        );
      })}
    </div>
  );
}
