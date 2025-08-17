class Solution {
    public List<Boolean> kidsWithCandies(int[] candies, int extraCandies) {
        int len=candies.length;
        int maxCan=Integer.MIN_VALUE;
        int temp=0;
        List<Boolean> res= new ArrayList<Boolean>();
        for(int i=0;i<len;i++){
            if(maxCan<candies[i]){
                maxCan=candies[i];
            }
        }
        System.out.println(maxCan);
        for(int i=0;i<len;i++){
            if(maxCan<=(candies[i]+extraCandies)){
                res.add(true);
            }
            else{
                res.add(false);
            }
        }
        return res;
    }
}