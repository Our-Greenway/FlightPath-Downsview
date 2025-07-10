interface DescriptionInterface {
    id: number;
    location: string;
    created_at: string;
    feature: string;
    image: string;
    "bg-colour": string | null;
}

const Description = ({ data }: { data: DescriptionInterface }) => {
    const bgColour = data["bg-colour"] ? `#${data["bg-colour"]}26` : "#FFFFFF";
  
    return (
        <div className="flex items-start gap-3 mb-2 p-4 rounded-3xl w-full"style={{ backgroundColor: bgColour }} >
        <div className="w-[40px] h-[40px] flex items-center justify-center rounded-full flex-shrink-0">
            <img src={`${data.image}`} alt="icon" className="w-[40px] h-[40px] object-contain" />
        </div>
        <p className="text-black font-semibold leading-snug">
            {data.feature}
        </p>
        </div>

    );
  };
  
  export default Description;
