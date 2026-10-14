import React, { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * @typedef {Object} NavItem
 * @property {string} label
 * @property {string} href
 */

/**
 * @param {Object} props
 * @param {NavItem[]} [props.items]
 * @param {string} [props.className]
 * @param {(item: NavItem, index: number) => void} [props.onItemClick]
 * @param {number} [props.defaultActiveIndex]
 * @param {string} [props.activeHref]
 */
export function SpotlightNavbar({
    items = [
        { label: "Home", href: "#home" },
        { label: "About", href: "#about" },
        { label: "Events", href: "#events" },
        { label: "Sponsors", href: "#sponsors" },
        { label: "Pricing", href: "#pricing" },
    ],
    className,
    onItemClick,
    defaultActiveIndex = 0,
    activeHref,
}) {
    const navRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
    const [hoverX, setHoverX] = useState(null);

    // Refs for the "light" positions so we can animate them imperatively
    const spotlightX = useRef(0);
    const ambienceX = useRef(0);

    // Sync activeIndex with activeHref or defaultActiveIndex when updated
    useEffect(() => {
        if (activeHref) {
            const idx = items.findIndex((it) => it.href === activeHref);
            if (idx !== -1) {
                setActiveIndex(idx);
            }
        } else if (defaultActiveIndex !== undefined) {
            setActiveIndex(defaultActiveIndex);
        }
    }, [activeHref, defaultActiveIndex, items]);

    // Handle mouse movement for Spotlight
    useEffect(() => {
        if (!navRef.current) return;
        const nav = navRef.current;

        const handleMouseMove = (e) => {
            const rect = nav.getBoundingClientRect();
            const x = e.clientX - rect.left;
            setHoverX(x);
            // Direct update for immediate feedback (no spring for the mouse itself, feels snappier)
            spotlightX.current = x;
            nav.style.setProperty("--spotlight-x", `${x}px`);
        };

        const handleMouseLeave = () => {
            setHoverX(null);
            // When mouse leaves, spring the spotlight back to the active item
            const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);
            if (activeItem) {
                const navRect = nav.getBoundingClientRect();
                const itemRect = activeItem.getBoundingClientRect();
                const targetX = itemRect.left - navRect.left + itemRect.width / 2;

                animate(spotlightX.current, targetX, {
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    onUpdate: (v) => {
                        spotlightX.current = v;
                        nav.style.setProperty("--spotlight-x", `${v}px`);
                    },
                });
            }
        };

        nav.addEventListener("mousemove", handleMouseMove);
        nav.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            nav.removeEventListener("mousemove", handleMouseMove);
            nav.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [activeIndex]);

    // Handle the "Ambience" (Active Item) Movement
    useEffect(() => {
        if (!navRef.current) return;
        const nav = navRef.current;
        const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);

        if (activeItem) {
            const navRect = nav.getBoundingClientRect();
            const itemRect = activeItem.getBoundingClientRect();
            const targetX = itemRect.left - navRect.left + itemRect.width / 2;

            animate(ambienceX.current, targetX, {
                type: "spring",
                stiffness: 200,
                damping: 20,
                onUpdate: (v) => {
                    ambienceX.current = v;
                    nav.style.setProperty("--ambience-x", `${v}px`);
                },
            });
        }
    }, [activeIndex]);

    const handleItemClick = (item, index) => {
        setActiveIndex(index);
        onItemClick?.(item, index);
    };

    return (
        <div className={cn("relative flex justify-center", className)}>
            <nav
                ref={navRef}
                className={cn(
                    "spotlight-nav spotlight-nav-bg glass-border spotlight-nav-shadow",
                    "relative h-11 rounded-full transition-all duration-300 overflow-hidden"
                )}
            >
                {/* Content */}
                <ul className="relative flex items-center h-full px-2 gap-0 z-[10]">
                    {items.map((item, idx) => (
                        <li key={idx} className="relative h-full flex items-center justify-center">
                            <a
                                href={item.href}
                                data-index={idx}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleItemClick(item, idx);
                                }}
                                className={cn(
                                    "px-4 py-2 text-sm font-semibold tracking-wider font-['Rajdhani'] transition-colors duration-200 rounded-full select-none cursor-pointer",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 dark:focus-visible:ring-cyan-300/40",
                                    // Active vs Inactive Text
                                    activeIndex === idx
                                        ? "text-cyan-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)] font-bold"
                                        : "text-gray-400 hover:text-white"
                                )}
                            >
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* LIGHTING LAYERS: CSS variables --spotlight-x and --ambience-x updated by JS */}

                {/* 1. The Moving Spotlight (Follows Mouse) */}
                <div
                    className="pointer-events-none absolute bottom-0 left-0 w-full h-full z-[1] transition-opacity duration-300"
                    style={{
                        opacity: hoverX !== null ? 1 : 0,
                        background: `radial-gradient(
                            120px circle at var(--spotlight-x, 0px) 100%, 
                            var(--spotlight-color, rgba(56,189,248,0.25)) 0%, 
                            transparent 60%
                        )`,
                    }}
                />

                {/* 2. The Active State Ambience (Stays on Active Item) */}
                <div
                    className="pointer-events-none absolute bottom-0 left-0 w-full h-[2px] z-[2]"
                    style={{
                        background: `radial-gradient(
                            60px circle at var(--ambience-x, 0px) 0%, 
                            var(--ambience-color, rgba(56,189,248,1)) 0%, 
                            transparent 100%
                        )`,
                    }}
                />
            </nav>
        </div>
    );
}

export default SpotlightNavbar;
