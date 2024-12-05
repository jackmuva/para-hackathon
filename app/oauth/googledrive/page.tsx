"use client";


export default function DriveAuth(){
    const params = Object.fromEntries(new URLSearchParams(window.location.hash.slice(1)));
    console.log(params);
    window.location.href = "http://localhost:3000";
};